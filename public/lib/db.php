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

function normalize_config_value(?string $value): ?string
{
    if ($value === null) {
        return null;
    }

    $normalized = trim($value);
    if ($normalized === '') {
        return null;
    }

    $startsWithDoubleQuote = strlen($normalized) >= 2 && substr($normalized, 0, 1) === '"';
    $endsWithDoubleQuote = strlen($normalized) >= 2 && substr($normalized, -1) === '"';
    $startsWithSingleQuote = strlen($normalized) >= 2 && substr($normalized, 0, 1) === "'";
    $endsWithSingleQuote = strlen($normalized) >= 2 && substr($normalized, -1) === "'";

    if (
        ($startsWithDoubleQuote && $endsWithDoubleQuote) ||
        ($startsWithSingleQuote && $endsWithSingleQuote)
    ) {
        $normalized = substr($normalized, 1, -1);
        $normalized = trim($normalized);
    }

    return $normalized === '' ? null : $normalized;
}

function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = normalize_config_value(env_value('DB_HOST', defined('FRAKKTUR_DB_HOST') ? (string) FRAKKTUR_DB_HOST : null));
    $port = normalize_config_value(env_value('DB_PORT', defined('FRAKKTUR_DB_PORT') ? (string) FRAKKTUR_DB_PORT : '3306'));
    $dbName = normalize_config_value(env_value('DB_NAME', defined('FRAKKTUR_DB_NAME') ? (string) FRAKKTUR_DB_NAME : null));
    $user = normalize_config_value(env_value('DB_USER', defined('FRAKKTUR_DB_USER') ? (string) FRAKKTUR_DB_USER : null));
    $password = normalize_config_value(env_value('DB_PASSWORD', defined('FRAKKTUR_DB_PASSWORD') ? (string) FRAKKTUR_DB_PASSWORD : null));

    if (!$host || !$port || !$dbName || !$user || !$password) {
        throw new RuntimeException('Database configuration is missing. Set DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in public/config.php.');
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName);
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
