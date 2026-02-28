-- Run in phpMyAdmin (manual step)
-- Purpose: remove redundant stock/size columns from legacy category tables,
-- because source of truth is now products + product_sizes.

ALTER TABLE IF EXISTS tshirts
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;

ALTER TABLE IF EXISTS hoodies
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;

ALTER TABLE IF EXISTS caps
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;

ALTER TABLE IF EXISTS belts
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;

ALTER TABLE IF EXISTS pants
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;

ALTER TABLE IF EXISTS knitwear
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;

ALTER TABLE IF EXISTS leather_jackets
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS available_sizes_json;
