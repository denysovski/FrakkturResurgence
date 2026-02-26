<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

function get_authenticated_user(PDO $pdo): ?array
{
    $userId = $_SESSION['user_id'] ?? null;
    if (!is_numeric($userId)) {
        return null;
    }

    $stmt = $pdo->prepare(
        'SELECT id, email, full_name, status
         FROM users
         WHERE id = ?
         LIMIT 1'
    );
    $stmt->execute([(int) $userId]);
    $user = $stmt->fetch();

    return $user ?: null;
}
