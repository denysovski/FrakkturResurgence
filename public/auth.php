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
