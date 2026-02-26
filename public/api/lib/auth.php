<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

function create_session_token(PDO $pdo, int $userId): string
{
    ensure_sessions_table($pdo);

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);

    $stmt = $pdo->prepare('INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 12 HOUR))');
    $stmt->execute([$userId, $tokenHash]);

    return $token;
}

function get_bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!is_string($header) || stripos($header, 'Bearer ') !== 0) {
        return null;
    }

    $token = trim(substr($header, 7));
    return $token !== '' ? $token : null;
}

function get_authenticated_user(PDO $pdo): ?array
{
    ensure_sessions_table($pdo);

    $token = get_bearer_token();
    if ($token === null) {
        return null;
    }

    $tokenHash = hash('sha256', $token);

    $stmt = $pdo->prepare(
        'SELECT u.id, u.email, u.full_name, u.status
         FROM auth_sessions s
         INNER JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
         LIMIT 1'
    );
    $stmt->execute([$tokenHash]);
    $user = $stmt->fetch();

    return $user ?: null;
}
