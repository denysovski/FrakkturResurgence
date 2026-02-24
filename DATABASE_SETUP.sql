-- =============================================================
-- FRAKKTUR / PPDATABASE FULL DATABASE SETUP (phpMyAdmin import)
-- Host: db.db049.endora.cz
-- User: testdomainpp
-- DB:   ppdatabase
-- =============================================================

CREATE DATABASE IF NOT EXISTS ppdatabase
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ppdatabase;

SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- Clean up programmable objects first (safe re-import)
-- -------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_wishlist_limit_before_insert;
DROP PROCEDURE IF EXISTS sp_randomize_product_sizes;

-- -------------------------------------------------------------
-- 1) USERS + AUTH/VERIFICATION
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('inactive','active') NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_verification_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_verification_user (user_id),
  KEY idx_verification_expires (expires_at),
  CONSTRAINT fk_verification_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2) PRODUCT CATALOG (MASTER)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(64) NOT NULL,
  title VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  product_code VARCHAR(40) NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock_total INT UNSIGNED NOT NULL DEFAULT 0,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  has_sizes TINYINT(1) NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_code (product_code),
  KEY idx_products_category (category_id),
  KEY idx_products_active (is_active),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stores ONLY available sizes with stock > 0
-- (frontend should display only rows returned from this table)
CREATE TABLE IF NOT EXISTS product_sizes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  size_code VARCHAR(16) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_product_size (product_id, size_code),
  KEY idx_product_sizes_stock (stock),
  CONSTRAINT fk_product_sizes_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3) CATEGORY-SPECIFIC TABLES (as requested)
--    Each table keeps product-level information by category
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tshirts (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_tshirts_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hoodies (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_hoodies_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS caps (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_caps_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS belts (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_belts_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pants (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_pants_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS knitwear (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_knitwear_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leather_jackets (
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  available_sizes_json JSON NULL,
  price_cents INT UNSIGNED NOT NULL,
  material VARCHAR(255) NOT NULL,
  sustainability VARCHAR(255) NOT NULL,
  image_key VARCHAR(255) NULL,
  PRIMARY KEY (product_id),
  CONSTRAINT fk_leather_jackets_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 4) USER WISHLIST + CART (user-scoped, no cookies)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
  KEY idx_wishlist_user (user_id),
  CONSTRAINT fk_wishlist_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  size_code VARCHAR(16) NOT NULL DEFAULT 'UNI',
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_user_product_size (user_id, product_id, size_code),
  KEY idx_cart_user (user_id),
  CONSTRAINT fk_cart_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 5) BUSINESS RULE ENFORCEMENT
-- -------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_wishlist_limit_before_insert
BEFORE INSERT ON wishlist_items
FOR EACH ROW
BEGIN
  DECLARE wishlist_count INT;

  SELECT COUNT(*) INTO wishlist_count
  FROM wishlist_items
  WHERE user_id = NEW.user_id;

  IF wishlist_count >= 50 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Wishlist limit reached (50 items max per user).';
  END IF;
END$$

DELIMITER ;

-- -------------------------------------------------------------
-- 6) DEFAULT CATEGORIES + RANDOM SIZE GENERATOR
-- -------------------------------------------------------------
INSERT INTO categories (slug, title) VALUES
  ('tshirts', 'T-Shirts'),
  ('hoodies', 'Hoodies'),
  ('caps', 'Caps'),
  ('belts', 'Belts'),
  ('pants', 'Pants'),
  ('knitwear', 'Knitwear'),
  ('leather-jackets', 'Leather Jackets')
ON DUPLICATE KEY UPDATE title = VALUES(title);

DELIMITER $$

CREATE PROCEDURE sp_randomize_product_sizes()
BEGIN
  -- Clear previous available sizes
  DELETE FROM product_sizes;

  -- Sized products: S, M, L, XL, XXL with random availability
  -- Keep only rows where random stock > 0
  INSERT INTO product_sizes (product_id, size_code, stock)
  SELECT q.product_id, q.size_code, q.stock
  FROM (
    SELECT p.id AS product_id, s.size_code,
           CASE WHEN RAND() > 0.35 THEN FLOOR(1 + RAND() * 40) ELSE 0 END AS stock
    FROM products p
    INNER JOIN categories c ON c.id = p.category_id
    INNER JOIN (
      SELECT 'S' AS size_code
      UNION ALL SELECT 'M'
      UNION ALL SELECT 'L'
      UNION ALL SELECT 'XL'
      UNION ALL SELECT 'XXL'
    ) s
    WHERE p.has_sizes = 1
      AND p.is_active = 1
      AND c.slug <> 'caps'
  ) q
  WHERE q.stock > 0;

  -- Caps / no-size products: store as UNI (if available)
  INSERT INTO product_sizes (product_id, size_code, stock)
  SELECT p.id, 'UNI', FLOOR(1 + RAND() * 60)
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
  WHERE p.is_active = 1
    AND (p.has_sizes = 0 OR c.slug = 'caps');

  -- Recompute products.stock_total from per-size stocks
  UPDATE products p
  LEFT JOIN (
    SELECT product_id, COALESCE(SUM(stock), 0) AS total_stock
    FROM product_sizes
    GROUP BY product_id
  ) x ON x.product_id = p.id
  SET p.stock_total = COALESCE(x.total_stock, 0);
END$$

DELIMITER ;

-- -------------------------------------------------------------
-- 7) OPTIONAL VIEW FOR FRONTEND (only available sizes)
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_product_available_sizes AS
SELECT
  p.id AS product_id,
  p.product_code,
  c.slug AS category_slug,
  GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS available_sizes_csv
FROM products p
INNER JOIN categories c ON c.id = p.category_id
LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
WHERE p.is_active = 1
GROUP BY p.id, p.product_code, c.slug;

-- =============================================================
-- IMPORTANT USAGE NOTES:
-- 1) Insert all your real products into `products` + category tables
-- 2) Then run: CALL sp_randomize_product_sizes();
-- 3) Frontend must query only sizes where stock > 0 from `product_sizes`
-- 4) Users remain inactive until OTP verification is completed
-- =============================================================
