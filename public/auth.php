<?php

require_once __DIR__ . '/lib/db.php';

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params(array(
        'lifetime' => 60 * 60 * 12,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ));
} else {
    session_set_cookie_params(60 * 60 * 12, '/; samesite=Lax', '', $isHttps, true);
}

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

function json_response($data, $status)
{
    http_response_code((int) $status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_response($message, $status)
{
    json_response(array('error' => (string) $message), (int) $status);
}

function read_json_body()
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return array();
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : array();
}

function is_debug_enabled()
{
    return defined('FRAKKTUR_DEBUG') && FRAKKTUR_DEBUG === true;
}

function table_has_column($pdo, $table, $column)
{
        $sql = 'SELECT 1
                        FROM information_schema.COLUMNS
                        WHERE TABLE_SCHEMA = DATABASE()
                            AND TABLE_NAME = ?
                            AND COLUMN_NAME = ?
                        LIMIT 1';
    $stmt = $pdo->prepare($sql);
        $stmt->execute(array($table, $column));
    return (bool) $stmt->fetch();
}

function require_auth_user_id()
{
    $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    if (!is_numeric($userId)) {
        error_response('Unauthorized', 401);
    }

    return (int) $userId;
}

function require_admin_user_id($pdo)
{
    if (!table_has_column($pdo, 'users', 'is_admin')) {
        error_response('Forbidden', 403);
    }

    $userId = require_auth_user_id();
    $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ? LIMIT 1');
    $stmt->execute(array($userId));
    $row = $stmt->fetch();
    $isAdmin = $row ? ((int) $row['is_admin'] === 1) : false;
    if (!$isAdmin) {
        error_response('Forbidden', 403);
    }

    return $userId;
}

function size_codes_for_category($categoryKey)
{
    if ($categoryKey === 'caps' || $categoryKey === 'belts') {
        return array('UNI');
    }

    return array('XS', 'S', 'M', 'L', 'XL', 'XXL');
}

function ensure_size_rows_for_product($pdo, $productId, $categoryKey)
{
    $expected = size_codes_for_category($categoryKey);

    if (count($expected) === 1 && $expected[0] === 'UNI') {
        $stmtDelete = $pdo->prepare('DELETE FROM product_sizes WHERE product_id = ? AND size_code <> ?');
        $stmtDelete->execute(array($productId, 'UNI'));
    }

    $stmtInsert = $pdo->prepare(
        'INSERT INTO product_sizes (product_id, size_code, stock)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE stock = stock'
    );

    foreach ($expected as $sizeCode) {
        $stmtInsert->execute(array($productId, $sizeCode, rand(0, 100)));
    }
}

function ensure_user_item_tables($pdo)
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS cart_items (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            product_id BIGINT UNSIGNED NOT NULL,
            size_code VARCHAR(32) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_cart_user_product_size (user_id, product_id, size_code),
            KEY idx_cart_user (user_id),
            CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS wishlist_items (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            product_id BIGINT UNSIGNED NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
            KEY idx_wishlist_user (user_id),
            CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
}

function ensure_admin_schema_and_account($pdo)
{
    if (!table_has_column($pdo, 'users', 'is_admin')) {
        try {
            $pdo->exec("ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0");
        } catch (Exception $e) {
            error_log('[frakktur-auth] could not add is_admin column: ' . $e->getMessage());
        }
    }

    $hasIsAdmin = table_has_column($pdo, 'users', 'is_admin');
    $hasStatus = table_has_column($pdo, 'users', 'status');

    if ($hasStatus) {
        $pdo->exec("UPDATE users SET status = 'active' WHERE status <> 'active'");
    }

    $adminEmail = 'dankosvobodkaaaa@gmail.com';
    $adminName = 'Daniel';
    $adminPassword = 'Frakktur12354G@';
    $adminHash = password_hash($adminPassword, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute(array($adminEmail));
    $existing = $stmt->fetch();

    if ($existing) {
        if ($hasStatus && $hasIsAdmin) {
            $upd = $pdo->prepare("UPDATE users SET full_name = ?, password_hash = ?, is_admin = 1, status = 'active' WHERE id = ?");
            $upd->execute(array($adminName, $adminHash, (int) $existing['id']));
        } else if ($hasStatus) {
            $upd = $pdo->prepare("UPDATE users SET full_name = ?, password_hash = ?, status = 'active' WHERE id = ?");
            $upd->execute(array($adminName, $adminHash, (int) $existing['id']));
        } else if ($hasIsAdmin) {
            $upd = $pdo->prepare('UPDATE users SET full_name = ?, password_hash = ?, is_admin = 1 WHERE id = ?');
            $upd->execute(array($adminName, $adminHash, (int) $existing['id']));
        } else {
            $upd = $pdo->prepare('UPDATE users SET full_name = ?, password_hash = ? WHERE id = ?');
            $upd->execute(array($adminName, $adminHash, (int) $existing['id']));
        }
        return;
    }

    if ($hasStatus && $hasIsAdmin) {
        $ins = $pdo->prepare("INSERT INTO users (email, full_name, password_hash, status, is_admin) VALUES (?, ?, ?, 'active', 1)");
        $ins->execute(array($adminEmail, $adminName, $adminHash));
    } else if ($hasStatus) {
        $ins = $pdo->prepare("INSERT INTO users (email, full_name, password_hash, status) VALUES (?, ?, ?, 'active')");
        $ins->execute(array($adminEmail, $adminName, $adminHash));
    } else if ($hasIsAdmin) {
        $ins = $pdo->prepare('INSERT INTO users (email, full_name, password_hash, is_admin) VALUES (?, ?, ?, 1)');
        $ins->execute(array($adminEmail, $adminName, $adminHash));
    } else {
        $ins = $pdo->prepare('INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)');
        $ins->execute(array($adminEmail, $adminName, $adminHash));
    }
}

function parse_cart_key($key)
{
    $parts = explode(':', (string) $key);
    if (count($parts) !== 3) {
        return null;
    }

    return array(
        'categoryKey' => $parts[0],
        'productCode' => $parts[1],
        'sizeCode' => $parts[2],
    );
}

function parse_wishlist_key($key)
{
    $parts = explode(':', (string) $key);
    if (count($parts) !== 2) {
        return null;
    }

    return array(
        'categoryKey' => $parts[0],
        'productCode' => $parts[1],
    );
}

function find_product_id($pdo, $categoryKey, $productCode)
{
    $stmt = $pdo->prepare(
        'SELECT p.id
         FROM products p
         INNER JOIN categories c ON c.id = p.category_id
         WHERE c.slug = ? AND p.product_code = ?
         LIMIT 1'
    );
    $stmt->execute(array($categoryKey, $productCode));
    $row = $stmt->fetch();

    return $row ? (int) $row['id'] : null;
}

function map_product_row_for_frontend($row)
{
    $sizesCsv = isset($row['sizes_csv']) ? (string) $row['sizes_csv'] : '';
    $sizes = array();
    if ($sizesCsv !== '') {
        $parts = explode(',', $sizesCsv);
        foreach ($parts as $part) {
            $size = trim($part);
            if ($size !== '') {
                $sizes[] = $size;
            }
        }
    }

    return array(
        'dbId' => (int) $row['id'],
        'id' => (string) $row['product_code'],
        'categoryKey' => (string) $row['category_slug'],
        'categoryTitle' => (string) $row['category_title'],
        'name' => (string) $row['name'],
        'price' => '€' . number_format(((int) $row['price_cents']) / 100, 2, '.', ''),
        'description' => (string) $row['description'],
        'material' => (string) $row['material'],
        'sustainability' => (string) $row['sustainability'],
        'imageKey' => (string) (isset($row['image_key']) ? $row['image_key'] : ''),
        'sizes' => $sizes,
    );
}

function admin_asset_categories()
{
    return array('tshirts', 'hoodies', 'caps', 'belts', 'pants', 'knitwear', 'leather-jackets');
}

function category_image_prefix($categoryKey)
{
    $map = array(
        'tshirts' => 't',
        'hoodies' => 'h',
        'caps' => 'c',
        'belts' => 'b',
        'pants' => 'p',
        'knitwear' => 'k',
        'leather-jackets' => 'j',
    );

    return isset($map[$categoryKey]) ? $map[$categoryKey] : 'img';
}

function derive_product_code($categoryKey, $imageKey)
{
    $normalizedKey = normalize_image_key_for_storage($imageKey, $categoryKey);
    $fileName = trim((string) basename((string) $normalizedKey));
    if ($fileName !== '') {
        $baseName = strtolower((string) pathinfo($fileName, PATHINFO_FILENAME));
        if (preg_match('/^[a-z][0-9]+$/', $baseName)) {
            return $baseName;
        }
    }

    $prefix = category_image_prefix($categoryKey);
    return $prefix . time();
}

function normalize_image_key_for_storage($imageKey, $categoryKey)
{
    $value = trim((string) $imageKey);
    if ($value === '') {
        return '';
    }

    if (preg_match('/^https?:\/\//i', $value)) {
        return $value;
    }

    $value = str_replace('\\', '/', $value);
    $parts = explode('/', $value);
    $filename = trim((string) end($parts));
    if ($filename === '') {
        return '';
    }

    $categories = admin_asset_categories();
    foreach ($categories as $category) {
        if (strpos($value, $category . '/') !== false) {
            return $category . '/' . $filename;
        }
    }

    if (in_array($categoryKey, $categories, true)) {
        return $categoryKey . '/' . $filename;
    }

    return $filename;
}

function list_assets_for_category($baseDir, $categoryKey)
{
    $dir = $baseDir . '/' . $categoryKey;
    if (!is_dir($dir)) {
        return array();
    }

    $result = array();
    $entries = scandir($dir);
    if (!is_array($entries)) {
        return array();
    }

    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }

        $path = $dir . '/' . $entry;
        if (!is_file($path)) {
            continue;
        }

        if (!preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $entry)) {
            continue;
        }

        $result[] = array(
            'category' => $categoryKey,
            'fileName' => $entry,
            'imageKey' => $categoryKey . '/' . $entry,
        );
    }

    usort($result, function ($a, $b) {
        return strcmp($a['fileName'], $b['fileName']);
    });

    return $result;
}

$emailRe = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
$action = isset($_GET['action']) ? strtolower(trim((string) $_GET['action'])) : '';
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

try {
    $pdo = get_pdo();
    ensure_admin_schema_and_account($pdo);
    $hasIsAdmin = table_has_column($pdo, 'users', 'is_admin');
    $hasStatus = table_has_column($pdo, 'users', 'status');

    if ($action === 'me' && $method === 'GET') {
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        if (!is_numeric($userId)) {
            error_response('Unauthorized', 401);
        }
        if ($hasIsAdmin) {
            $stmt = $pdo->prepare('SELECT id, email, full_name, is_admin FROM users WHERE id = ? LIMIT 1');
        } else {
            $stmt = $pdo->prepare('SELECT id, email, full_name, 0 AS is_admin FROM users WHERE id = ? LIMIT 1');
        }
        $stmt->execute(array((int) $userId));
        $user = $stmt->fetch();

        if (!$user) {
            error_response('Unauthorized', 401);
        }

        json_response(array(
            'user' => array(
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'fullName' => (string) $user['full_name'],
                'status' => 'active',
                'isAdmin' => ((int) $user['is_admin'] === 1),
            ),
        ), 200);
    }

    if ($action === 'register' && $method === 'POST') {
        $body = read_json_body();
        $fullName = isset($body['fullName']) ? trim((string) $body['fullName']) : '';
        $email = isset($body['email']) ? strtolower(trim((string) $body['email'])) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';

        if ($fullName === '' || $email === '' || $password === '') {
            error_response('Name, email, and password are required.', 400);
        }

        if (!preg_match($emailRe, $email)) {
            error_response('Invalid email format.', 400);
        }

        if (strlen($fullName) < 2 || strlen($fullName) > 120) {
            error_response('Name must be 2-120 characters.', 400);
        }

        if (strlen($password) < 6 || strlen($password) > 72) {
            error_response('Password must be 6-72 characters.', 400);
        }

        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $exists->execute(array($email));
        if ($exists->fetch()) {
            error_response('Email is already registered.', 409);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        if ($hasStatus && $hasIsAdmin) {
            $insert = $pdo->prepare("INSERT INTO users (email, full_name, password_hash, status, is_admin) VALUES (?, ?, ?, 'active', 0)");
            $insert->execute(array($email, $fullName, $passwordHash));
        } else if ($hasStatus) {
            $insert = $pdo->prepare("INSERT INTO users (email, full_name, password_hash, status) VALUES (?, ?, ?, 'active')");
            $insert->execute(array($email, $fullName, $passwordHash));
        } else if ($hasIsAdmin) {
            $insert = $pdo->prepare('INSERT INTO users (email, full_name, password_hash, is_admin) VALUES (?, ?, ?, 0)');
            $insert->execute(array($email, $fullName, $passwordHash));
        } else {
            $insert = $pdo->prepare('INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)');
            $insert->execute(array($email, $fullName, $passwordHash));
        }

        $userId = (int) $pdo->lastInsertId();
        $_SESSION['user_id'] = $userId;

        json_response(array(
            'user' => array(
                'id' => $userId,
                'email' => $email,
                'fullName' => $fullName,
                'status' => 'active',
                'isAdmin' => false,
            ),
        ), 201);
    }

    if ($action === 'login' && $method === 'POST') {
        $body = read_json_body();
        $email = isset($body['email']) ? strtolower(trim((string) $body['email'])) : '';
        $password = isset($body['password']) ? (string) $body['password'] : '';

        if (!preg_match($emailRe, $email) || $password === '') {
            error_response('Invalid email or password.', 401);
        }

        if ($hasIsAdmin) {
            $stmt = $pdo->prepare('SELECT id, email, full_name, password_hash, is_admin FROM users WHERE email = ? LIMIT 1');
        } else {
            $stmt = $pdo->prepare('SELECT id, email, full_name, password_hash, 0 AS is_admin FROM users WHERE email = ? LIMIT 1');
        }
        $stmt->execute(array($email));
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            error_response('Invalid email or password.', 401);
        }

        $_SESSION['user_id'] = (int) $user['id'];

        json_response(array(
            'user' => array(
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'fullName' => (string) $user['full_name'],
                'status' => 'active',
                'isAdmin' => ((int) $user['is_admin'] === 1),
            ),
        ), 200);
    }

    if ($action === 'logout' && $method === 'POST') {
        $_SESSION = array();
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            $path = isset($params['path']) ? $params['path'] : '/';
            $domain = isset($params['domain']) ? $params['domain'] : '';
            $secure = isset($params['secure']) ? (bool) $params['secure'] : false;
            $httponly = isset($params['httponly']) ? (bool) $params['httponly'] : true;
            setcookie(session_name(), '', time() - 42000, $path, $domain, $secure, $httponly);
        }
        session_destroy();
        json_response(array('ok' => true), 200);
    }

    if ($action === 'products_by_category' && $method === 'GET') {
        $categoryKey = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
        if ($categoryKey === '') {
            error_response('Category is required.', 400);
        }

        $stmtIds = $pdo->prepare('SELECT p.id FROM products p INNER JOIN categories c ON c.id = p.category_id WHERE c.slug = ?');
        $stmtIds->execute(array($categoryKey));
        $ids = $stmtIds->fetchAll();
        foreach ($ids as $idRow) {
            ensure_size_rows_for_product($pdo, (int) $idRow['id'], $categoryKey);
        }

        $stmt = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(CASE WHEN ps.stock > 0 THEN ps.size_code END ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id
             WHERE c.slug = ? AND p.is_active = 1
             GROUP BY p.id, c.slug, c.title
             ORDER BY p.product_code ASC"
        );
        $stmt->execute(array($categoryKey));
        $rows = $stmt->fetchAll();

        $products = array();
        foreach ($rows as $row) {
            $products[] = map_product_row_for_frontend($row);
        }

        json_response(array('products' => $products), 200);
    }

    if ($action === 'product_get' && $method === 'GET') {
        $categoryKey = isset($_GET['category']) ? trim((string) $_GET['category']) : '';
        $productCode = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
        if ($categoryKey === '' || $productCode === '') {
            error_response('Category and id are required.', 400);
        }

        $stmt = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(CASE WHEN ps.stock > 0 THEN ps.size_code END ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id
             WHERE c.slug = ? AND p.product_code = ? AND p.is_active = 1
             GROUP BY p.id, c.slug, c.title
             LIMIT 1"
        );
        $stmt->execute(array($categoryKey, $productCode));
        $row = $stmt->fetch();

        if (!$row) {
            error_response('Product not found.', 404);
        }

        ensure_size_rows_for_product($pdo, (int) $row['id'], $categoryKey);

        $stmtReload = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(CASE WHEN ps.stock > 0 THEN ps.size_code END ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id
             WHERE p.id = ?
             GROUP BY p.id, c.slug, c.title
             LIMIT 1"
        );
        $stmtReload->execute(array((int) $row['id']));
        $freshRow = $stmtReload->fetch();

        json_response(array('product' => map_product_row_for_frontend($freshRow ? $freshRow : $row)), 200);
    }

    if ($action === 'search' && $method === 'GET') {
        $query = isset($_GET['q']) ? trim((string) $_GET['q']) : '';
        if ($query === '') {
            json_response(array('products' => array()), 200);
        }

        $like = '%' . $query . '%';
        $stmt = $pdo->prepare(
            "SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
                    c.slug AS category_slug, c.title AS category_title,
                    GROUP_CONCAT(CASE WHEN ps.stock > 0 THEN ps.size_code END ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             LEFT JOIN product_sizes ps ON ps.product_id = p.id
             WHERE p.is_active = 1 AND (p.name LIKE ? OR c.title LIKE ?)
             GROUP BY p.id, c.slug, c.title
             ORDER BY p.product_code ASC"
        );
        $stmt->execute(array($like, $like));
        $rows = $stmt->fetchAll();

        $products = array();
        foreach ($rows as $row) {
            $products[] = map_product_row_for_frontend($row);
        }

        json_response(array('products' => $products), 200);
    }

    if ($action === 'admin_options' && $method === 'GET') {
        require_admin_user_id($pdo);

        $defaultDescriptions = array(
            'Clean-cut tee built for everyday layering and bold streetwear styling.',
            'Relaxed hoodie silhouette with premium weight for structured comfort.',
            'Tailored street pants balancing movement, structure, and everyday wearability.',
            'Soft knit textures with modern proportions for transitional weather.'
        );
        $defaultSustainability = array(
            'Made in limited runs to reduce overproduction waste.',
            'Produced in audited facilities with reduced water usage.',
            'Responsibly sourced fibers and low-impact finishing process.',
            'Dyed with low-impact pigments and shipped in recyclable packaging.'
        );

        $stmtD = $pdo->query('SELECT DISTINCT description FROM products WHERE description IS NOT NULL AND description <> "" ORDER BY description ASC LIMIT 200');
        $stmtS = $pdo->query('SELECT DISTINCT sustainability FROM products WHERE sustainability IS NOT NULL AND sustainability <> "" ORDER BY sustainability ASC LIMIT 200');

        $desc = $defaultDescriptions;
        $sus = $defaultSustainability;

        foreach ($stmtD->fetchAll() as $row) {
            $desc[] = (string) $row['description'];
        }
        foreach ($stmtS->fetchAll() as $row) {
            $sus[] = (string) $row['sustainability'];
        }

        $desc = array_values(array_unique($desc));
        $sus = array_values(array_unique($sus));

        json_response(array('descriptions' => $desc, 'sustainability' => $sus), 200);
    }

    if ($action === 'admin_products_get' && $method === 'GET') {
        require_admin_user_id($pdo);

        $stmt = $pdo->query(
            'SELECT p.id, p.product_code, p.name, p.description, p.stock_total, p.price_cents, p.material, p.sustainability, p.image_key, p.is_active,
                    c.slug AS category_key, c.title AS category_title
             FROM products p
             INNER JOIN categories c ON c.id = p.category_id
             ORDER BY c.slug ASC, p.product_code ASC'
        );
        $rows = $stmt->fetchAll();

        $productMap = array();
        $productIds = array();
        foreach ($rows as $row) {
            $pid = (int) $row['id'];
            $categoryKey = (string) $row['category_key'];

            $productMap[$pid] = array(
                'dbId' => $pid,
                'id' => (string) $row['product_code'],
                'categoryKey' => $categoryKey,
                'categoryTitle' => (string) $row['category_title'],
                'name' => (string) $row['name'],
                'description' => (string) $row['description'],
                'stockTotal' => (int) $row['stock_total'],
                'priceCents' => (int) $row['price_cents'],
                'material' => (string) $row['material'],
                'sustainability' => (string) $row['sustainability'],
                'imageKey' => (string) (isset($row['image_key']) ? $row['image_key'] : ''),
                'isActive' => (int) $row['is_active'] === 1,
                'sizeStocks' => array(),
            );
            $productIds[] = $pid;
        }

        if (count($productIds) > 0) {
            $in = implode(',', array_map('intval', $productIds));
            $sizeRows = $pdo->query('SELECT product_id, size_code, stock FROM product_sizes WHERE product_id IN (' . $in . ')')->fetchAll();
            foreach ($sizeRows as $srow) {
                $pid = (int) $srow['product_id'];
                if (!isset($productMap[$pid])) {
                    continue;
                }
                $productMap[$pid]['sizeStocks'][(string) $srow['size_code']] = (int) $srow['stock'];
            }
        }

        json_response(array('products' => array_values($productMap)), 200);
    }

    if ($action === 'admin_product_save' && $method === 'POST') {
        require_admin_user_id($pdo);
        $body = read_json_body();

        $dbId = isset($body['dbId']) && is_numeric($body['dbId']) ? (int) $body['dbId'] : 0;
        $categoryKey = isset($body['categoryKey']) ? trim((string) $body['categoryKey']) : '';
        $productCode = isset($body['id']) ? trim((string) $body['id']) : '';
        $name = isset($body['name']) ? trim((string) $body['name']) : '';
        $description = isset($body['description']) ? trim((string) $body['description']) : '';
        $material = isset($body['material']) ? trim((string) $body['material']) : '';
        $sustainability = isset($body['sustainability']) ? trim((string) $body['sustainability']) : '';
        $imageKey = isset($body['imageKey']) ? normalize_image_key_for_storage($body['imageKey'], $categoryKey) : '';
        $isActive = isset($body['isActive']) ? ((bool) $body['isActive']) : true;
        $sizeStocksInput = isset($body['sizeStocks']) && is_array($body['sizeStocks']) ? $body['sizeStocks'] : array();

        $priceCents = isset($body['priceCents']) ? max(0, (int) $body['priceCents']) : 0;

        if ($categoryKey === '' || $name === '' || $description === '' || $material === '' || $sustainability === '' || $imageKey === '') {
            error_response('Category, name, description, material, sustainability, and image are required.', 400);
        }

        if ($productCode === '') {
            $productCode = derive_product_code($categoryKey, $imageKey);
        }

        $stmtCat = $pdo->prepare('SELECT id, title FROM categories WHERE slug = ? LIMIT 1');
        $stmtCat->execute(array($categoryKey));
        $catRow = $stmtCat->fetch();
        if (!$catRow) {
            error_response('Unknown category.', 400);
        }
        $categoryId = (int) $catRow['id'];

        $expectedSizes = size_codes_for_category($categoryKey);
        $sizeStocks = array();
        $stockTotal = 0;
        foreach ($expectedSizes as $sizeCode) {
            $incoming = isset($sizeStocksInput[$sizeCode]) ? (int) $sizeStocksInput[$sizeCode] : 0;
            if ($incoming < 0) {
                $incoming = 0;
            }
            if ($incoming > 100) {
                $incoming = 100;
            }
            $sizeStocks[$sizeCode] = $incoming;
            $stockTotal += $incoming;
        }

        $existing = null;
        if ($dbId > 0) {
            $stmtExisting = $pdo->prepare('SELECT id FROM products WHERE id = ? LIMIT 1');
            $stmtExisting->execute(array($dbId));
            $existing = $stmtExisting->fetch();
        }

        if (!$existing && $productCode !== '') {
            $stmtExisting = $pdo->prepare('SELECT id FROM products WHERE product_code = ? LIMIT 1');
            $stmtExisting->execute(array($productCode));
            $existing = $stmtExisting->fetch();
        }

        $pdo->beginTransaction();
        try {
            if ($existing) {
                $productId = (int) $existing['id'];
                $upd = $pdo->prepare(
                    'UPDATE products
                     SET category_id = ?, product_code = ?, name = ?, description = ?, stock_total = ?, price_cents = ?, material = ?, sustainability = ?, image_key = ?, is_active = ?, has_sizes = ?
                     WHERE id = ?'
                );
                $upd->execute(array(
                    $categoryId,
                    $productCode,
                    $name,
                    $description,
                    $stockTotal,
                    $priceCents,
                    $material,
                    $sustainability,
                    $imageKey,
                    $isActive ? 1 : 0,
                    (count($expectedSizes) === 1 && $expectedSizes[0] === 'UNI') ? 0 : 1,
                    $productId,
                ));
            } else {
                $ins = $pdo->prepare(
                    'INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );
                $ins->execute(array(
                    $categoryId,
                    $productCode,
                    $name,
                    $description,
                    $stockTotal,
                    $priceCents,
                    $material,
                    $sustainability,
                    $imageKey,
                    (count($expectedSizes) === 1 && $expectedSizes[0] === 'UNI') ? 0 : 1,
                    $isActive ? 1 : 0,
                ));
                $productId = (int) $pdo->lastInsertId();
            }

            $pdo->prepare('DELETE FROM product_sizes WHERE product_id = ?')->execute(array($productId));
            $insSize = $pdo->prepare('INSERT INTO product_sizes (product_id, size_code, stock) VALUES (?, ?, ?)');
            foreach ($sizeStocks as $sizeCode => $stock) {
                $insSize->execute(array($productId, $sizeCode, $stock));
            }

            $pdo->commit();
        } catch (Exception $inner) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $inner;
        }

        json_response(array('ok' => true, 'productId' => $productId, 'productCode' => $productCode), 200);
    }

    if ($action === 'admin_product_delete' && $method === 'POST') {
        require_admin_user_id($pdo);
        $body = read_json_body();
        $productCode = isset($body['id']) ? trim((string) $body['id']) : '';
        if ($productCode === '') {
            error_response('Product code is required.', 400);
        }

        $stmt = $pdo->prepare('DELETE FROM products WHERE product_code = ?');
        $stmt->execute(array($productCode));
        json_response(array('ok' => true), 200);
    }

    if ($action === 'admin_assets_list' && $method === 'GET') {
        require_admin_user_id($pdo);

        $baseAssetsDir = __DIR__ . '/assets';
        $filterCategory = isset($_GET['category']) ? trim((string) $_GET['category']) : 'all';
        $categories = admin_asset_categories();

        $items = array();
        foreach ($categories as $category) {
            if ($filterCategory !== 'all' && $filterCategory !== $category) {
                continue;
            }
            $items = array_merge($items, list_assets_for_category($baseAssetsDir, $category));
        }

        json_response(array('items' => $items), 200);
    }

    if (($action === 'admin_asset_upload' || $action === 'admin_upload_image') && $method === 'POST') {
        require_admin_user_id($pdo);

        if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
            error_response('Image file is required.', 400);
        }

        $file = $_FILES['image'];
        if (!isset($file['error']) || (int) $file['error'] !== UPLOAD_ERR_OK) {
            error_response('Image upload failed.', 400);
        }

        $tmp = isset($file['tmp_name']) ? $file['tmp_name'] : '';
        $original = isset($file['name']) ? $file['name'] : '';
        if ($tmp === '' || $original === '') {
            error_response('Invalid uploaded file.', 400);
        }

        $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
        $allowed = array('jpg', 'jpeg', 'png', 'webp', 'gif');
        if (!in_array($ext, $allowed, true)) {
            error_response('Unsupported image format.', 400);
        }

        $categoryKey = isset($_POST['category']) ? trim((string) $_POST['category']) : '';
        if (!in_array($categoryKey, admin_asset_categories(), true)) {
            error_response('Category is required.', 400);
        }

        $uploadDir = __DIR__ . '/assets/' . $categoryKey;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $prefix = category_image_prefix($categoryKey);
        $nextIndex = 0;
        $entries = scandir($uploadDir);
        if (is_array($entries)) {
            foreach ($entries as $entry) {
                if (preg_match('/^' . preg_quote($prefix, '/') . '(\d+)\.(jpg|jpeg|png|webp|gif)$/i', $entry, $matches)) {
                    $n = (int) $matches[1];
                    if ($n > $nextIndex) {
                        $nextIndex = $n;
                    }
                }
            }
        }
        $nextIndex += 1;
        $filename = $prefix . $nextIndex . '.' . $ext;
        $target = $uploadDir . '/' . $filename;

        if (!move_uploaded_file($tmp, $target)) {
            error_response('Failed to move uploaded image.', 500);
        }

        $imageKey = $categoryKey . '/' . $filename;
        json_response(array('ok' => true, 'imageKey' => $imageKey), 200);
    }

    if ($action === 'admin_asset_delete' && $method === 'POST') {
        require_admin_user_id($pdo);

        $body = read_json_body();
        $rawImageKey = isset($body['imageKey']) ? (string) $body['imageKey'] : '';
        $normalized = normalize_image_key_for_storage($rawImageKey, '');
        if ($normalized === '') {
            error_response('Image key is required.', 400);
        }

        $parts = explode('/', str_replace('\\', '/', $normalized));
        if (count($parts) < 2) {
            error_response('Invalid image key.', 400);
        }

        $categoryKey = trim((string) $parts[0]);
        if (!in_array($categoryKey, admin_asset_categories(), true)) {
            error_response('Invalid image category.', 400);
        }

        $fileName = basename(trim((string) end($parts)));
        if ($fileName === '' || !preg_match('/\.(jpg|jpeg|png|webp|gif)$/i', $fileName)) {
            error_response('Invalid image file.', 400);
        }

        $target = __DIR__ . '/assets/' . $categoryKey . '/' . $fileName;
        if (!is_file($target)) {
            json_response(array('ok' => true, 'deleted' => false), 200);
        }

        if (!unlink($target)) {
            error_response('Failed to delete image file.', 500);
        }

        json_response(array('ok' => true, 'deleted' => true), 200);
    }

    if ($action === 'cart_get' && $method === 'GET') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();

        $stmt = $pdo->prepare(
            'SELECT c.slug AS category_key, p.product_code, ci.size_code, ci.quantity
             FROM cart_items ci
             INNER JOIN products p ON p.id = ci.product_id
             INNER JOIN categories c ON c.id = p.category_id
             WHERE ci.user_id = ?
             ORDER BY ci.id DESC'
        );
        $stmt->execute(array($userId));
        $rows = $stmt->fetchAll();

        $items = array();
        foreach ($rows as $row) {
            $categoryKey = (string) $row['category_key'];
            $productCode = (string) $row['product_code'];
            $sizeCode = (string) $row['size_code'];
            $items[] = array(
                'key' => $categoryKey . ':' . $productCode . ':' . $sizeCode,
                'id' => $productCode,
                'categoryKey' => $categoryKey,
                'size' => $sizeCode,
                'quantity' => (int) $row['quantity'],
            );
        }

        json_response(array('items' => $items), 200);
    }

    if ($action === 'cart_add' && $method === 'POST') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();
        $body = read_json_body();

        $categoryKey = isset($body['categoryKey']) ? trim((string) $body['categoryKey']) : '';
        $productCode = isset($body['productCode']) ? trim((string) $body['productCode']) : '';
        $sizeCode = isset($body['size']) ? trim((string) $body['size']) : '';
        $quantity = isset($body['quantity']) ? (int) $body['quantity'] : 1;

        if ($categoryKey === '' || $productCode === '' || $sizeCode === '' || $quantity <= 0) {
            error_response('Invalid cart item payload.', 400);
        }

        $productId = find_product_id($pdo, $categoryKey, $productCode);
        if (!$productId) {
            error_response('Product not found.', 404);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO cart_items (user_id, product_id, size_code, quantity)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP'
        );
        $stmt->execute(array($userId, $productId, $sizeCode, $quantity));

        json_response(array('ok' => true), 200);
    }

    if ($action === 'cart_update' && $method === 'POST') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();
        $body = read_json_body();
        $key = isset($body['key']) ? trim((string) $body['key']) : '';
        $quantity = isset($body['quantity']) ? (int) $body['quantity'] : 0;

        $parts = parse_cart_key($key);
        if (!$parts) {
            error_response('Invalid cart key.', 400);
        }

        $productId = find_product_id($pdo, $parts['categoryKey'], $parts['productCode']);
        if (!$productId) {
            error_response('Product not found.', 404);
        }

        if ($quantity <= 0) {
            $stmt = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size_code = ?');
            $stmt->execute(array($userId, $productId, $parts['sizeCode']));
            json_response(array('ok' => true), 200);
        }

        $stmt = $pdo->prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ? AND size_code = ?');
        $stmt->execute(array($quantity, $userId, $productId, $parts['sizeCode']));
        json_response(array('ok' => true), 200);
    }

    if ($action === 'cart_remove' && $method === 'POST') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();
        $body = read_json_body();
        $key = isset($body['key']) ? trim((string) $body['key']) : '';
        $parts = parse_cart_key($key);
        if (!$parts) {
            error_response('Invalid cart key.', 400);
        }

        $productId = find_product_id($pdo, $parts['categoryKey'], $parts['productCode']);
        if (!$productId) {
            json_response(array('ok' => true), 200);
        }

        $stmt = $pdo->prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND size_code = ?');
        $stmt->execute(array($userId, $productId, $parts['sizeCode']));

        json_response(array('ok' => true), 200);
    }

    if ($action === 'wishlist_get' && $method === 'GET') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();

        $stmt = $pdo->prepare(
            'SELECT c.slug AS category_key, p.product_code
             FROM wishlist_items wi
             INNER JOIN products p ON p.id = wi.product_id
             INNER JOIN categories c ON c.id = p.category_id
             WHERE wi.user_id = ?
             ORDER BY wi.id DESC'
        );
        $stmt->execute(array($userId));
        $rows = $stmt->fetchAll();

        $items = array();
        foreach ($rows as $row) {
            $categoryKey = (string) $row['category_key'];
            $productCode = (string) $row['product_code'];
            $items[] = array(
                'key' => $categoryKey . ':' . $productCode,
                'id' => $productCode,
                'categoryKey' => $categoryKey,
            );
        }

        json_response(array('items' => $items), 200);
    }

    if ($action === 'wishlist_add' && $method === 'POST') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();
        $body = read_json_body();
        $categoryKey = isset($body['categoryKey']) ? trim((string) $body['categoryKey']) : '';
        $productCode = isset($body['productCode']) ? trim((string) $body['productCode']) : '';

        if ($categoryKey === '' || $productCode === '') {
            error_response('Invalid wishlist payload.', 400);
        }

        $productId = find_product_id($pdo, $categoryKey, $productCode);
        if (!$productId) {
            error_response('Product not found.', 404);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO wishlist_items (user_id, product_id)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)'
        );
        $stmt->execute(array($userId, $productId));

        json_response(array('ok' => true), 200);
    }

    if ($action === 'wishlist_remove' && $method === 'POST') {
        ensure_user_item_tables($pdo);
        $userId = require_auth_user_id();
        $body = read_json_body();
        $key = isset($body['key']) ? trim((string) $body['key']) : '';
        $parts = parse_wishlist_key($key);
        if (!$parts) {
            error_response('Invalid wishlist key.', 400);
        }

        $productId = find_product_id($pdo, $parts['categoryKey'], $parts['productCode']);
        if (!$productId) {
            json_response(array('ok' => true), 200);
        }

        $stmt = $pdo->prepare('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?');
        $stmt->execute(array($userId, $productId));

        json_response(array('ok' => true), 200);
    }

    error_response('Invalid auth action.', 404);
} catch (Exception $e) {
    error_log('[frakktur-auth] ' . $e->getMessage());

    if (!is_debug_enabled()) {
        error_response('Server error.', 500);
    }

    $sqlCode = null;
    if ($e instanceof PDOException && isset($e->errorInfo[1])) {
        $sqlCode = (int) $e->errorInfo[1];
    }

    json_response(array(
        'error' => 'Server error.',
        'debug' => array(
            'exception' => get_class($e),
            'sqlCode' => $sqlCode,
            'message' => $e->getMessage(),
        ),
    ), 500);
}
