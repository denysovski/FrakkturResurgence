<?php

declare(strict_types=1);

require_once __DIR__ . '/lib/db.php';

$isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_set_cookie_params([
    'lifetime' => 60 * 60 * 12,
    'path' => '/',
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_response(string $message, int $status = 400): void
{
    json_response(['error' => $message], $status);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

$emailRe = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
$nameRe = '/^[a-zA-ZÀ-ž\'\- ]{2,120}$/u';
$passwordRe = '/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/';

$action = strtolower(trim((string) ($_GET['action'] ?? '')));
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    $pdo = get_pdo();

    if ($action === 'me' && $method === 'GET') {
        $userId = $_SESSION['user_id'] ?? null;
        if (!is_numeric($userId)) {
            error_response('Unauthorized', 401);
        }

        $stmt = $pdo->prepare('SELECT id, email, full_name, status FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([(int) $userId]);
        $user = $stmt->fetch();

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

    if ($action === 'register' && $method === 'POST') {
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
            error_response('Password must be 8-72 chars with uppercase, number, and special character.', 400);
        }

        $exists = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $exists->execute([$email]);
        if ($exists->fetch()) {
            error_response('Email is already registered.', 409);
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO users (email, full_name, password_hash, status) VALUES (?, ?, ?, 'active')");
        $insert->execute([$email, $fullName, $passwordHash]);
        $userId = (int) $pdo->lastInsertId();

        $_SESSION['user_id'] = $userId;

        json_response([
            'user' => [
                'id' => $userId,
                'email' => $email,
                'fullName' => $fullName,
                'status' => 'active',
            ],
        ], 201);
    }

    if ($action === 'login' && $method === 'POST') {
        $body = read_json_body();
        $email = strtolower(trim((string) ($body['email'] ?? '')));
        $password = (string) ($body['password'] ?? '');

        if (!preg_match($emailRe, $email) || $password === '') {
            error_response('Invalid email or password.', 401);
        }

        $stmt = $pdo->prepare('SELECT id, email, full_name, status, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, (string) $user['password_hash'])) {
            error_response('Invalid email or password.', 401);
        }

        $_SESSION['user_id'] = (int) $user['id'];

        json_response([
            'user' => [
                'id' => (int) $user['id'],
                'email' => (string) $user['email'],
                'fullName' => (string) $user['full_name'],
                'status' => (string) $user['status'],
            ],
        ]);
    }

    if ($action === 'logout' && $method === 'POST') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'] ?? '/', $params['domain'] ?? '', (bool) ($params['secure'] ?? false), (bool) ($params['httponly'] ?? true));
        }
        session_destroy();
        json_response(['ok' => true]);
    }

    error_response('Invalid auth action.', 404);
} catch (Throwable $e) {
    error_response('Server error: ' . $e->getMessage(), 500);
}
