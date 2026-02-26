<?php

declare(strict_types=1);

// Load private config directly as an extra safeguard for shared hosting path quirks.
$configPath = __DIR__ . '/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
}

require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$expectedKey = defined('FRAKKTUR_DB_CHECK_KEY') ? trim((string) FRAKKTUR_DB_CHECK_KEY) : '';
$providedKey = trim((string) ($_GET['key'] ?? ''));

if ($expectedKey === '' || $providedKey === '' || !hash_equals($expectedKey, $providedKey)) {
    http_response_code(403);
    echo json_encode([
        'ok' => false,
        'error' => 'Forbidden',
        'hint' => 'Set FRAKKTUR_DB_CHECK_KEY in public/config.php and pass ?key=...',
        'debug' => [
            'configFound' => file_exists($configPath),
            'keyDefined' => defined('FRAKKTUR_DB_CHECK_KEY'),
            'expectedKeyLength' => strlen($expectedKey),
            'providedKeyLength' => strlen($providedKey),
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $pdo = get_pdo();
    $pdo->query('SELECT 1');

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'message' => 'Database connection successful.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
} catch (Throwable $e) {
    error_log('[frakktur-db-check] ' . $e->getMessage());

    $errorCode = null;
    if ($e instanceof PDOException && isset($e->errorInfo[1])) {
        $errorCode = (int) $e->errorInfo[1];
    }

    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Database connection failed.',
        'code' => $errorCode,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
