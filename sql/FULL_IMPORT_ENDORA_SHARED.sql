-- =============================================================
-- FRAKKTUR / PPDATABASE FULL DATABASE SETUP (phpMyAdmin import)
-- Host: db.db049.endora.cz
-- User: testdomainpp
-- DB:   ppdatabase
-- =============================================================

USE ppdatabase;

SET NAMES utf8mb4;

-- -------------------------------------------------------------
-- Clean up programmable objects first (safe re-import)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS user_verification_codes;

-- -------------------------------------------------------------
-- 1) USERS + AUTH
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



-- =============================================================
-- IMPORTANT USAGE NOTES:
-- 1) Insert all your real products into `products` + category tables
-- 2) Size randomization runs inline at the end of this file.
-- 3) Frontend must query only sizes where stock > 0 from `product_sizes`
-- 4) Any legacy verification-code table can be removed safely
-- =============================================================


-- =============================================================
-- 8) FULL PRODUCT SEED DATA (single-file import)
-- =============================================================

-- Upsert all products and category-specific records

-- T-Shirts
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts1', 'Essential White Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts1', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts1' LIMIT 1), 'Essential White Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts2', 'Urban Black Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts2', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts2' LIMIT 1), 'Urban Black Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts3', 'Graphic Print Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 5900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts3', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts3' LIMIT 1), 'Graphic Print Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 5900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts4', 'Oversized Grey Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 5400, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts4', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts4' LIMIT 1), 'Oversized Grey Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 5400, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts5', 'Minimalist Cream Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts5', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts5' LIMIT 1), 'Minimalist Cream Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts6', 'Classic Black Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts6', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts6' LIMIT 1), 'Classic Black Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts7', 'Vintage Blue Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 5900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts7', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts7' LIMIT 1), 'Vintage Blue Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 5900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts8', 'Streetwear Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 6400, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts8', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts8' LIMIT 1), 'Streetwear Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 6400, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts9', 'Premium Cotton Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 5400, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts9', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts9' LIMIT 1), 'Premium Cotton Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 5400, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts10', 'Signature Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts10', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts10' LIMIT 1), 'Signature Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts11', 'Limited Edition Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 6900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts11', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts11' LIMIT 1), 'Limited Edition Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 6900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts12', 'Comfort Fit Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts12', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts12' LIMIT 1), 'Comfort Fit Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts13', 'Designer Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 7900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts13', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts13' LIMIT 1), 'Designer Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 7900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts14', 'Casual Crew Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts14', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts14' LIMIT 1), 'Casual Crew Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 4900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='tshirts' LIMIT 1), 'ts15', 'Premium Blend Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, 5900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts15', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO tshirts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='ts15' LIMIT 1), 'Premium Blend Tee', 'Clean-cut tee built for everyday layering and bold streetwear styling.', 0, '["XS","S","M","L","XL","XXL"]', 5900, '100% combed cotton jersey', 'Dyed with low-impact pigments and shipped in recyclable packaging', 'ts15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Hoodies
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h1', 'Essential Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h1', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h1' LIMIT 1), 'Essential Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h2', 'Oversized Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 9900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h2', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h2' LIMIT 1), 'Oversized Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h3', 'Graphic Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h3', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h3' LIMIT 1), 'Graphic Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h4', 'Premium Fleece', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 10900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h4', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h4' LIMIT 1), 'Premium Fleece', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 10900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h5', 'Classic Black Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h5', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h5' LIMIT 1), 'Classic Black Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h6', 'Urban Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 9400, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h6', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h6' LIMIT 1), 'Urban Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 9400, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h7', 'Minimalist Design', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h7', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h7' LIMIT 1), 'Minimalist Design', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h8', 'Streetwear Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 9900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h8', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h8' LIMIT 1), 'Streetwear Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h9', 'Tech Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 10400, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h9', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h9' LIMIT 1), 'Tech Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 10400, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h10', 'Comfort Fit Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h10', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h10' LIMIT 1), 'Comfort Fit Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h11', 'Limited Edition', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 11900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h11', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h11' LIMIT 1), 'Limited Edition', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 11900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h12', 'Premium Quality', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 9900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h12', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h12' LIMIT 1), 'Premium Quality', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h13', 'Signature Style', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h13', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h13' LIMIT 1), 'Signature Style', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h14', 'Casual Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 9400, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h14', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h14' LIMIT 1), 'Casual Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 9400, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='hoodies' LIMIT 1), 'h15', 'Designer Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, 12900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h15', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO hoodies (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='h15' LIMIT 1), 'Designer Hoodie', 'Relaxed hoodie silhouette with premium weight for structured comfort.', 0, '["XS","S","M","L","XL","XXL"]', 12900, 'Heavyweight brushed cotton fleece', 'Produced in audited facilities with reduced water usage', 'h15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Caps
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c1', 'Stealth Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3500, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c1', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c1' LIMIT 1), 'Stealth Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3500, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c2', 'Classic Baseball Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c2', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c2' LIMIT 1), 'Classic Baseball Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c3', 'Urban Street Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 4200, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c3', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c3' LIMIT 1), 'Urban Street Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 4200, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c4', 'Premium Cotton Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c4', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c4' LIMIT 1), 'Premium Cotton Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c5', 'Logo Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c5', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c5' LIMIT 1), 'Logo Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c6', 'Vintage Wash Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c6', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c6' LIMIT 1), 'Vintage Wash Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c7', 'Minimalist Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3500, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c7', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c7' LIMIT 1), 'Minimalist Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3500, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c8', 'Heritage Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 4400, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c8', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c8' LIMIT 1), 'Heritage Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 4400, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c9', 'Adjustable Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c9', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c9' LIMIT 1), 'Adjustable Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c10', 'Casual Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3500, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c10', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c10' LIMIT 1), 'Casual Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3500, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c11', 'Limited Edition Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 4900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c11', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c11' LIMIT 1), 'Limited Edition Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 4900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c12', 'Premium Flex Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 4200, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c12', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c12' LIMIT 1), 'Premium Flex Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 4200, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c13', 'Designer Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 5900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c13', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c13' LIMIT 1), 'Designer Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 5900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c14', 'Snapback Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c14', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c14' LIMIT 1), 'Snapback Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 3900, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='caps' LIMIT 1), 'c15', 'Signature Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, 4400, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c15', 0, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO caps (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='c15' LIMIT 1), 'Signature Cap', 'Structured cap profile made to complete clean and functional street outfits.', 0, '["UNI"]', 4400, 'Organic cotton twill with inner sweatband', 'Small-batch production and plastic-free shipping materials', 'c15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Belts
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b1', 'Leather Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 5900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b1', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b1' LIMIT 1), 'Leather Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 5900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b2', 'Canvas Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 4400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b2', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b2' LIMIT 1), 'Canvas Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 4400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b3', 'Premium Leather Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 7900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b3', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b3' LIMIT 1), 'Premium Leather Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 7900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b4', 'Street Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 4900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b4', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b4' LIMIT 1), 'Street Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 4900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b5', 'Classic Black Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 5400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b5', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b5' LIMIT 1), 'Classic Black Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 5400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b6', 'Brown Leather Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 6400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b6', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b6' LIMIT 1), 'Brown Leather Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 6400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b7', 'Minimalist Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 4400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b7', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b7' LIMIT 1), 'Minimalist Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 4400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b8', 'Heritage Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 6900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b8', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b8' LIMIT 1), 'Heritage Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 6900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b9', 'Silver Buckle Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 5400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b9', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b9' LIMIT 1), 'Silver Buckle Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 5400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b10', 'Casual Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 4400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b10', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b10' LIMIT 1), 'Casual Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 4400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b11', 'Limited Edition Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 8900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b11', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b11' LIMIT 1), 'Limited Edition Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b12', 'Premium Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 7400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b12', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b12' LIMIT 1), 'Premium Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 7400, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b13', 'Designer Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 9900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b13', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b13' LIMIT 1), 'Designer Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b14', 'Urban Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 5900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b14', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b14' LIMIT 1), 'Urban Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 5900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='belts' LIMIT 1), 'b15', 'Signature Belt', 'Statement belt hardware with clean lines and daily durability.', 0, 6900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b15', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO belts (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='b15' LIMIT 1), 'Signature Belt', 'Statement belt hardware with clean lines and daily durability.', 0, '["XS","S","M","L","XL","XXL"]', 6900, 'Full-grain leather and metal buckle', 'Sourced from traceable tanneries and packaged without single-use plastics', 'b15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Pants
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p1', 'Classic Denim', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 7900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p1', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p1' LIMIT 1), 'Classic Denim', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 7900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p2', 'Slim Fit Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 7400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p2', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p2' LIMIT 1), 'Slim Fit Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 7400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p3', 'Cargo Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 8900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p3', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p3' LIMIT 1), 'Cargo Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p4', 'Black Trousers', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 8400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p4', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p4' LIMIT 1), 'Black Trousers', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 8400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p5', 'Minimalist Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 7400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p5', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p5' LIMIT 1), 'Minimalist Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 7400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p6', 'Street Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 7900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p6', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p6' LIMIT 1), 'Street Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 7900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p7', 'Heritage Denim', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 8900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p7', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p7' LIMIT 1), 'Heritage Denim', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p8', 'Comfort Fit Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 7900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p8', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p8' LIMIT 1), 'Comfort Fit Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 7900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p9', 'Urban Trousers', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 8400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p9', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p9' LIMIT 1), 'Urban Trousers', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 8400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p10', 'Casual Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 7400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p10', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p10' LIMIT 1), 'Casual Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 7400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p11', 'Limited Edition Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 9900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p11', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p11' LIMIT 1), 'Limited Edition Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p12', 'Premium Denim', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 9400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p12', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p12' LIMIT 1), 'Premium Denim', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 9400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p13', 'Designer Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 11900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p13', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p13' LIMIT 1), 'Designer Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 11900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p14', 'Signature Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 8400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p14', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p14' LIMIT 1), 'Signature Jeans', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 8400, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='pants' LIMIT 1), 'p15', 'Tech Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, 8900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p15', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO pants (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='p15' LIMIT 1), 'Tech Pants', 'Tailored street pants balancing movement, structure, and everyday wearability.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Cotton twill with added stretch', 'Made in limited runs to reduce overproduction waste', 'p15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Knitwear
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k1', 'Wool Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, 8900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k1', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k1' LIMIT 1), 'Wool Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k2', 'Cable Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, 9400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k2', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k2' LIMIT 1), 'Cable Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 9400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k3', 'Merino Wool', 'Soft knit textures with modern proportions for transitional weather.', 0, 9900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k3', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k3' LIMIT 1), 'Merino Wool', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k4', 'Oversized Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, 10400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k4', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k4' LIMIT 1), 'Oversized Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 10400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k5', 'Turtleneck', 'Soft knit textures with modern proportions for transitional weather.', 0, 7900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k5', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k5' LIMIT 1), 'Turtleneck', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 7900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k6', 'V-Neck Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, 8400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k6', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k6' LIMIT 1), 'V-Neck Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 8400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k7', 'Minimalist Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, 8900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k7', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k7' LIMIT 1), 'Minimalist Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 8900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k8', 'Heritage Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, 9900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k8', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k8' LIMIT 1), 'Heritage Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k9', 'Cardigan Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, 9400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k9', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k9' LIMIT 1), 'Cardigan Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 9400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k10', 'Casual Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, 7900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k10', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k10' LIMIT 1), 'Casual Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 7900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k11', 'Limited Edition', 'Soft knit textures with modern proportions for transitional weather.', 0, 11900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k11', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k11' LIMIT 1), 'Limited Edition', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 11900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k12', 'Premium Wool', 'Soft knit textures with modern proportions for transitional weather.', 0, 10900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k12', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k12' LIMIT 1), 'Premium Wool', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 10900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k13', 'Designer Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, 13900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k13', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k13' LIMIT 1), 'Designer Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 13900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k14', 'Urban Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, 9400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k14', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k14' LIMIT 1), 'Urban Knit', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 9400, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='knitwear' LIMIT 1), 'k15', 'Signature Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, 9900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k15', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO knitwear (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='k15' LIMIT 1), 'Signature Sweater', 'Soft knit textures with modern proportions for transitional weather.', 0, '["XS","S","M","L","XL","XXL"]', 9900, 'Wool blend yarn with anti-pilling finish', 'Responsibly sourced fibers and low-impact finishing process', 'k15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Leather Jackets
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j1', 'Leather Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 19900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j1', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j1' LIMIT 1), 'Leather Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 19900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j1')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j2', 'Bomber Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 14900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j2', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j2' LIMIT 1), 'Bomber Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 14900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j2')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j3', 'Denim Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 11900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j3', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j3' LIMIT 1), 'Denim Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 11900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j3')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j4', 'Varsity Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 16900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j4', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j4' LIMIT 1), 'Varsity Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 16900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j4')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j5', 'Classic Leather', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 18900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j5', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j5' LIMIT 1), 'Classic Leather', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 18900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j5')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j6', 'Street Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 13900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j6', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j6' LIMIT 1), 'Street Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 13900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j6')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j7', 'Minimalist Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 12900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j7', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j7' LIMIT 1), 'Minimalist Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 12900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j7')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j8', 'Heritage Leather', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 20900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j8', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j8' LIMIT 1), 'Heritage Leather', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 20900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j8')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j9', 'Premium Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 15900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j9', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j9' LIMIT 1), 'Premium Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 15900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j9')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j10', 'Urban Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 14400, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j10', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j10' LIMIT 1), 'Urban Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 14400, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j10')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j11', 'Limited Edition', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 22900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j11', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j11' LIMIT 1), 'Limited Edition', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 22900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j11')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j12', 'Designer Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 24900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j12', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j12' LIMIT 1), 'Designer Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 24900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j12')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j13', 'Signature Leather', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 21900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j13', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j13' LIMIT 1), 'Signature Leather', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 21900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j14', 'Executive Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 17900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j14', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j14' LIMIT 1), 'Executive Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 17900, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j14')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
VALUES ((SELECT id FROM categories WHERE slug='leather-jackets' LIMIT 1), 'j15', 'Casual Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, 13400, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j15', 1, 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  has_sizes = VALUES(has_sizes),
  is_active = 1;
INSERT INTO leather_jackets (product_id, name, description, stock, available_sizes_json, price_cents, material, sustainability, image_key)
VALUES ((SELECT id FROM products WHERE product_code='j15' LIMIT 1), 'Casual Jacket', 'Outerwear built to age well, with strong silhouettes and durable construction.', 0, '["XS","S","M","L","XL","XXL"]', 13400, 'Premium leather / mixed technical shell depending on model', 'Durability-first production with repair-friendly component choices', 'j15')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  material = VALUES(material),
  sustainability = VALUES(sustainability),
  image_key = VALUES(image_key),
  available_sizes_json = VALUES(available_sizes_json);

-- Re-generate size availability and stock totals
-- Inline size randomization (procedure-free, shared-host compatible)
DELETE FROM product_sizes;

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
    AND c.slug NOT IN ('caps','belts')
) q
WHERE q.stock > 0;

INSERT INTO product_sizes (product_id, size_code, stock)
SELECT p.id, 'M', FLOOR(8 + RAND() * 25)
FROM products p
INNER JOIN categories c ON c.id = p.category_id
WHERE p.is_active = 1
  AND p.has_sizes = 1
  AND c.slug NOT IN ('caps','belts')
  AND NOT EXISTS (
    SELECT 1
    FROM product_sizes ps
    WHERE ps.product_id = p.id AND ps.stock > 0
  );

INSERT INTO product_sizes (product_id, size_code, stock)
SELECT p.id, 'UNI', FLOOR(1 + RAND() * 60)
FROM products p
INNER JOIN categories c ON c.id = p.category_id
WHERE p.is_active = 1
  AND (p.has_sizes = 0 OR c.slug IN ('caps','belts'));

UPDATE products p
LEFT JOIN (
  SELECT product_id, COALESCE(SUM(stock), 0) AS total_stock
  FROM product_sizes
  GROUP BY product_id
) x ON x.product_id = p.id
SET p.stock_total = COALESCE(x.total_stock, 0);