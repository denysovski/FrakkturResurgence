<?php

declare(strict_types=1);

$configPath = dirname(__DIR__) . '/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
}

function env_value(string $key, ?string $default = null): ?string
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
    if ($value === false || $value === null || $value === '') {
        return $default;
    }

    return (string) $value;
}

function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env_value('DB_HOST', defined('FRAKKTUR_DB_HOST') ? FRAKKTUR_DB_HOST : 'db.db049.endora.cz');
    $port = env_value('DB_PORT', defined('FRAKKTUR_DB_PORT') ? FRAKKTUR_DB_PORT : '3306');
    $dbName = env_value('DB_NAME', defined('FRAKKTUR_DB_NAME') ? FRAKKTUR_DB_NAME : 'ppdatabase');
    $user = env_value('DB_USER', defined('FRAKKTUR_DB_USER') ? FRAKKTUR_DB_USER : 'testdomainpp');
    $password = env_value('DB_PASSWORD', defined('FRAKKTUR_DB_PASSWORD') ? FRAKKTUR_DB_PASSWORD : 'Frakktur12354G@');

    if ($user === '' || $password === '') {
        throw new RuntimeException('Database credentials are not configured.');
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName);
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
