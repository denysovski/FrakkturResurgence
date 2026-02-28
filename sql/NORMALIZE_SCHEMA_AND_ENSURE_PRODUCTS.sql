-- Run in phpMyAdmin on ppdatabase
-- Goal:
-- 1) Keep a normal schema: categories + products + product_sizes (single source of truth)
-- 2) Ensure required product codes exist for all categories

USE ppdatabase;
SET NAMES utf8mb4;

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

INSERT INTO categories (slug, title) VALUES
  ('tshirts', 'T-Shirts'),
  ('hoodies', 'Hoodies'),
  ('caps', 'Caps'),
  ('belts', 'Belts'),
  ('pants', 'Pants'),
  ('knitwear', 'Knitwear'),
  ('leather-jackets', 'Leather Jackets')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Optional cleanup of old redundant category tables
DROP TABLE IF EXISTS tshirts;
DROP TABLE IF EXISTS hoodies;
DROP TABLE IF EXISTS caps;
DROP TABLE IF EXISTS belts;
DROP TABLE IF EXISTS pants;
DROP TABLE IF EXISTS knitwear;
DROP TABLE IF EXISTS leather_jackets;

-- Ensure required product codes exist
INSERT INTO products (category_id, product_code, name, description, stock_total, price_cents, material, sustainability, image_key, has_sizes, is_active)
SELECT c.id,
       p.code,
       CONCAT(UPPER(LEFT(p.code, 1)), SUBSTRING(p.code, 2), ' ', c.title),
       'Auto-seeded product. Edit in Admin Products.',
       CASE WHEN p.category_slug IN ('caps', 'belts') THEN 25 ELSE 60 END,
       4900,
       'Premium fabric blend',
       'Produced in limited runs.',
       CONCAT(p.category_slug, '/', p.code, '.jpg'),
       CASE WHEN p.category_slug IN ('caps', 'belts') THEN 0 ELSE 1 END,
       1
FROM (
  SELECT 'belts' AS category_slug, 'b1' AS code UNION ALL
  SELECT 'belts', 'b2' UNION ALL
  SELECT 'belts', 'b3' UNION ALL
  SELECT 'belts', 'b4' UNION ALL
  SELECT 'belts', 'b5' UNION ALL
  SELECT 'belts', 'b6' UNION ALL
  SELECT 'belts', 'b7' UNION ALL

  SELECT 'caps', 'c1' UNION ALL
  SELECT 'caps', 'c2' UNION ALL
  SELECT 'caps', 'c3' UNION ALL
  SELECT 'caps', 'c4' UNION ALL
  SELECT 'caps', 'c5' UNION ALL
  SELECT 'caps', 'c6' UNION ALL
  SELECT 'caps', 'c7' UNION ALL

  SELECT 'hoodies', 'h1' UNION ALL
  SELECT 'hoodies', 'h2' UNION ALL
  SELECT 'hoodies', 'h3' UNION ALL
  SELECT 'hoodies', 'h4' UNION ALL
  SELECT 'hoodies', 'h5' UNION ALL

  SELECT 'knitwear', 'k1' UNION ALL
  SELECT 'knitwear', 'k2' UNION ALL
  SELECT 'knitwear', 'k3' UNION ALL
  SELECT 'knitwear', 'k4' UNION ALL
  SELECT 'knitwear', 'k5' UNION ALL
  SELECT 'knitwear', 'k6' UNION ALL
  SELECT 'knitwear', 'k7' UNION ALL
  SELECT 'knitwear', 'k8' UNION ALL
  SELECT 'knitwear', 'k9' UNION ALL

  SELECT 'leather-jackets', 'j1' UNION ALL
  SELECT 'leather-jackets', 'j2' UNION ALL
  SELECT 'leather-jackets', 'j3' UNION ALL
  SELECT 'leather-jackets', 'j4' UNION ALL
  SELECT 'leather-jackets', 'j5' UNION ALL
  SELECT 'leather-jackets', 'j6' UNION ALL
  SELECT 'leather-jackets', 'j7' UNION ALL

  SELECT 'pants', 'p1' UNION ALL
  SELECT 'pants', 'p2' UNION ALL
  SELECT 'pants', 'p3' UNION ALL
  SELECT 'pants', 'p4' UNION ALL
  SELECT 'pants', 'p5' UNION ALL
  SELECT 'pants', 'p6' UNION ALL
  SELECT 'pants', 'p7' UNION ALL
  SELECT 'pants', 'p8' UNION ALL

  SELECT 'tshirts', 't1' UNION ALL
  SELECT 'tshirts', 't2' UNION ALL
  SELECT 'tshirts', 't3' UNION ALL
  SELECT 'tshirts', 't4' UNION ALL
  SELECT 'tshirts', 't5' UNION ALL
  SELECT 'tshirts', 't6' UNION ALL
  SELECT 'tshirts', 't7' UNION ALL
  SELECT 'tshirts', 't8' UNION ALL
  SELECT 'tshirts', 't9' UNION ALL
  SELECT 'tshirts', 't10'
) p
INNER JOIN categories c ON c.slug = p.category_slug
ON DUPLICATE KEY UPDATE
  category_id = VALUES(category_id),
  name = COALESCE(NULLIF(products.name, ''), VALUES(name)),
  description = COALESCE(NULLIF(products.description, ''), VALUES(description)),
  price_cents = GREATEST(products.price_cents, VALUES(price_cents)),
  material = COALESCE(NULLIF(products.material, ''), VALUES(material)),
  sustainability = COALESCE(NULLIF(products.sustainability, ''), VALUES(sustainability)),
  image_key = COALESCE(NULLIF(products.image_key, ''), VALUES(image_key)),
  has_sizes = VALUES(has_sizes),
  is_active = 1;

-- Reset size rows for required products to guaranteed defaults
DELETE ps
FROM product_sizes ps
INNER JOIN products p ON p.id = ps.product_id
WHERE p.product_code REGEXP '^(b|c|h|k|j|p|t)[0-9]+$';

-- UNI categories (caps, belts)
INSERT INTO product_sizes (product_id, size_code, stock)
SELECT p.id, 'UNI', 25
FROM products p
INNER JOIN categories c ON c.id = p.category_id
WHERE c.slug IN ('caps', 'belts')
  AND p.product_code REGEXP '^(b|c)[0-9]+$';

-- Sized categories
INSERT INTO product_sizes (product_id, size_code, stock)
SELECT p.id, s.size_code, 10
FROM products p
INNER JOIN categories c ON c.id = p.category_id
INNER JOIN (
  SELECT 'XS' AS size_code UNION ALL
  SELECT 'S' UNION ALL
  SELECT 'M' UNION ALL
  SELECT 'L' UNION ALL
  SELECT 'XL' UNION ALL
  SELECT 'XXL'
) s
WHERE c.slug IN ('tshirts', 'hoodies', 'pants', 'knitwear', 'leather-jackets')
  AND p.product_code REGEXP '^(t|h|p|k|j)[0-9]+$';

UPDATE products p
INNER JOIN (
  SELECT product_id, SUM(stock) AS total_stock
  FROM product_sizes
  GROUP BY product_id
) x ON x.product_id = p.id
SET p.stock_total = x.total_stock;
