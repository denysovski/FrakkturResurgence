<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/auth.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/frakkturresurgence#', '', $path);
$path = preg_replace('#^/api#', '', $path);
$path = '/' . ltrim((string) $path, '/');

$emailRe = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
$nameRe = '/^[a-zA-ZÀ-ž\'\- ]{2,120}$/u';
$passwordRe = '/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/';

try {
    $pdo = get_pdo();

    if ($method === 'GET' && $path === '/health') {
        json_response(['ok' => true]);
    }

    if ($method === 'POST' && $path === '/auth/register') {
        $body = read_json_body();
        $fullName = trim((string) ($body['fullName'] ?? ''));
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        if ($fullName === '' || $email === '' || $password === '') {
            error_response('Name, email, and password are required.', 400);
        }

        if (!preg_match($emailRe, $email)) {
            error_response('Invalid email format.', 400);
        }

        if (!preg_match($nameRe, $fullName)) {
            error_response('Name must be 2-120 characters and valid.', 400);
        }

        if (!preg_match($passwordRe, $password)) {
            error_response('Password must be 8-72 characters and include uppercase, number, and special character.', 400);
        }

        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $exists->execute([$email]);
        if ($exists->fetch()) {
            error_response('Email is already registered.', 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO users (email, full_name, password_hash, status) VALUES (?, ?, ?, 'active')");
        $insert->execute([$email, $fullName, $hash]);
        $userId = (int) $pdo->lastInsertId();

        $token = create_session_token($pdo, $userId);

        json_response([
            'message' => 'Account created successfully.',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'fullName' => $fullName,
                'status' => 'active',
            ],
        ], 201);
    }

    if ($method === 'POST' && $path === '/auth/login') {
        $body = read_json_body();
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        if (!preg_match($emailRe, $email) || strlen($password) < 8 || strlen($password) > 72) {
            error_response('Invalid email or password.', 401);
        }

        $stmt = $pdo->prepare('SELECT id, email, full_name, password_hash, status FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            error_response('Invalid email or password.', 401);
        }

        $token = create_session_token($pdo, (int) $user['id']);

        json_response([
            'token' => $token,
            'user' => [
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'fullName' => (string) $user['full_name'],
                'status' => (string) $user['status'],
            ],
        ]);
    }

    if ($method === 'GET' && $path === '/auth/me') {
        $user = get_authenticated_user($pdo);
        if (!$user) {
            error_response('Unauthorized', 401);
        }

        json_response([
            'user' => [
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'fullName' => (string) $user['full_name'],
                'status' => (string) $user['status'],
            ],
        ]);
    }

    if ($method === 'GET' && preg_match('#^/categories/([a-z\-]{2,40})/products$#', $path, $m)) {
        $slug = $m[1];
        $stmt = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
             WHERE c.slug = ? AND p.is_active = 1
             GROUP BY p.id, c.slug, c.title
             ORDER BY p.product_code ASC"
        );
        $stmt->execute([$slug]);
        $rows = $stmt->fetchAll();

        $products = array_map(static function (array $row): array {
            return [
                'dbId' => (int) $row['id'],
                'id' => (string) $row['product_code'],
                'categoryKey' => (string) $row['category_slug'],
                'categoryTitle' => (string) $row['category_title'],
                'name' => (string) $row['name'],
                'price' => '€' . number_format(((int) $row['price_cents']) / 100, 2, '.', ''),
                'description' => (string) $row['description'],
                'material' => (string) $row['material'],
                'sustainability' => (string) $row['sustainability'],
                'imageKey' => (string) ($row['image_key'] ?? ''),
                'sizes' => ($row['sizes_csv'] ?? null) ? explode(',', (string) $row['sizes_csv']) : [],
            ];
        }, $rows);

        json_response(['products' => $products]);
    }

    if ($method === 'GET' && preg_match('#^/products/([a-z\-]{2,40})/([a-zA-Z0-9\-]{1,40})$#', $path, $m)) {
        [$all, $categoryKey, $productCode] = $m;

        $stmt = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
             WHERE c.slug = ? AND p.product_code = ? AND p.is_active = 1
             GROUP BY p.id, c.slug, c.title
             LIMIT 1"
        );
        $stmt->execute([$categoryKey, $productCode]);
        $row = $stmt->fetch();

        if (!$row) {
            error_response('Product not found.', 404);
        }

        $product = [
            'dbId' => (int) $row['id'],
            'id' => (string) $row['product_code'],
            'categoryKey' => (string) $row['category_slug'],
            'categoryTitle' => (string) $row['category_title'],
            'name' => (string) $row['name'],
            'price' => '€' . number_format(((int) $row['price_cents']) / 100, 2, '.', ''),
            'description' => (string) $row['description'],
            'material' => (string) $row['material'],
            'sustainability' => (string) $row['sustainability'],
            'imageKey' => (string) ($row['image_key'] ?? ''),
            'sizes' => ($row['sizes_csv'] ?? null) ? explode(',', (string) $row['sizes_csv']) : [],
        ];

        json_response(['product' => $product]);
    }

    if ($method === 'GET' && $path === '/search') {
        $query = trim((string) ($_GET['q'] ?? ''));
        if ($query === '') {
            json_response(['products' => []]);
        }

        $like = '%' . $query . '%';
        $stmt = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
             WHERE p.is_active = 1 AND (p.name LIKE ? OR c.title LIKE ?)
             GROUP BY p.id, c.slug, c.title
             ORDER BY p.product_code ASC"
        );
        $stmt->execute([$like, $like]);
        $rows = $stmt->fetchAll();

        $products = array_map(static function (array $row): array {
            return [
                'dbId' => (int) $row['id'],
                'id' => (string) $row['product_code'],
                'categoryKey' => (string) $row['category_slug'],
                'categoryTitle' => (string) $row['category_title'],
                'name' => (string) $row['name'],
                'price' => '€' . number_format(((int) $row['price_cents']) / 100, 2, '.', ''),
                'description' => (string) $row['description'],
                'material' => (string) $row['material'],
                'sustainability' => (string) $row['sustainability'],
                'imageKey' => (string) ($row['image_key'] ?? ''),
                'sizes' => ($row['sizes_csv'] ?? null) ? explode(',', (string) $row['sizes_csv']) : [],
            ];
        }, $rows);

        json_response(['products' => $products]);
    }

    error_response('API endpoint not found.', 404);
} catch (Throwable $e) {
    error_response('Server error: ' . $e->getMessage(), 500);
}
