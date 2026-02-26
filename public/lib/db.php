<?php

$configPath = dirname(__DIR__) . '/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
}

function env_value($key, $default = null)
{
    $value = null;

    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        $value = $_ENV[$key];
    } elseif (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        $value = $_SERVER[$key];
    } else {
        $tmp = getenv($key);
        if ($tmp !== false && $tmp !== '') {
            $value = $tmp;
        }
    }

    if ($value === null || $value === '') {
        return $default;
    }

    return (string) $value;
}

function normalize_config_value($value)
{
    if ($value === null) {
        return null;
    }

    $normalized = trim((string) $value);
    if ($normalized === '') {
        return null;
    }

    $len = strlen($normalized);
    if ($len >= 2) {
        $first = substr($normalized, 0, 1);
        $last = substr($normalized, -1);
        $isDouble = ($first === '"' && $last === '"');
        $isSingle = ($first === "'" && $last === "'");

        if ($isDouble || $isSingle) {
            $normalized = trim(substr($normalized, 1, -1));
        }
    }

    return $normalized === '' ? null : $normalized;
}

function get_pdo()
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = normalize_config_value(env_value('DB_HOST', defined('FRAKKTUR_DB_HOST') ? FRAKKTUR_DB_HOST : null));
    $port = normalize_config_value(env_value('DB_PORT', defined('FRAKKTUR_DB_PORT') ? FRAKKTUR_DB_PORT : '3306'));
    $dbName = normalize_config_value(env_value('DB_NAME', defined('FRAKKTUR_DB_NAME') ? FRAKKTUR_DB_NAME : null));
    $user = normalize_config_value(env_value('DB_USER', defined('FRAKKTUR_DB_USER') ? FRAKKTUR_DB_USER : null));
    $password = normalize_config_value(env_value('DB_PASSWORD', defined('FRAKKTUR_DB_PASSWORD') ? FRAKKTUR_DB_PASSWORD : null));

    if (!$host || !$port || !$dbName || !$user || !$password) {
        throw new RuntimeException('Database configuration is missing.');
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName);
    $pdo = new PDO($dsn, $user, $password, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ));

    return $pdo;
}
