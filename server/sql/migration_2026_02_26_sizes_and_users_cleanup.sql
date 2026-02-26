-- Run this in phpMyAdmin on the active Endora database
USE ppdatabase;

-- 1) Remove legacy verification artifacts for users
DROP TABLE IF EXISTS user_verification_codes;

SET @dropVerificationCodeColumn := (
  SELECT IF(
    EXISTS(
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'verification_code'
    ),
    'ALTER TABLE users DROP COLUMN verification_code',
    'SELECT "users.verification_code not present"'
  )
);
PREPARE stmt_drop_verification_code FROM @dropVerificationCodeColumn;
EXECUTE stmt_drop_verification_code;
DEALLOCATE PREPARE stmt_drop_verification_code;

-- 2) Guarantee every active tshirt has at least S/M/L available sizes in DB
INSERT INTO product_sizes (product_id, size_code, stock)
SELECT p.id, sizes.size_code, 12
FROM products p
INNER JOIN categories c ON c.id = p.category_id
INNER JOIN (
  SELECT 'S' AS size_code
  UNION ALL SELECT 'M'
  UNION ALL SELECT 'L'
) sizes
WHERE p.is_active = 1
  AND c.slug = 'tshirts'
  AND NOT EXISTS (
    SELECT 1
    FROM product_sizes ps
    WHERE ps.product_id = p.id AND ps.stock > 0
  )
ON DUPLICATE KEY UPDATE stock = GREATEST(stock, VALUES(stock));
