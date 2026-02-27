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

function require_auth_user_id()
{
    $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    if (!is_numeric($userId)) {
        error_response('Unauthorized', 401);
    }

    return (int) $userId;
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

$emailRe = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
$action = isset($_GET['action']) ? strtolower(trim((string) $_GET['action'])) : '';
$method = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

try {
    $pdo = get_pdo();

    if ($action === 'me' && $method === 'GET') {
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        if (!is_numeric($userId)) {
            error_response('Unauthorized', 401);
        }

        $stmt = $pdo->prepare('SELECT id, email, full_name FROM users WHERE id = ? LIMIT 1');
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
        $insert = $pdo->prepare('INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)');
        $insert->execute(array($email, $fullName, $passwordHash));
        $userId = (int) $pdo->lastInsertId();

        $_SESSION['user_id'] = $userId;

        json_response(array(
            'user' => array(
                'id' => $userId,
                'email' => $email,
                'fullName' => $fullName,
                'status' => 'active',
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

        $stmt = $pdo->prepare('SELECT id, email, full_name, password_hash FROM users WHERE email = ? LIMIT 1');
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
