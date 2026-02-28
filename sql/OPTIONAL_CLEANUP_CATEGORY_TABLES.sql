-- Optional cleanup: remove redundant per-category tables
--
-- Your app uses:
--   - products (product-level data)
--   - product_sizes (size-level stock)
--
-- The per-category tables (tshirts, hoodies, caps, belts, pants, knitwear, leather_jackets)
-- are currently not required by the running code.
--
-- Run this only after confirming you don't use those tables for reporting/manual workflows.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS tshirts;
DROP TABLE IF EXISTS hoodies;
DROP TABLE IF EXISTS caps;
DROP TABLE IF EXISTS belts;
DROP TABLE IF EXISTS pants;
DROP TABLE IF EXISTS knitwear;
DROP TABLE IF EXISTS leather_jackets;

SET FOREIGN_KEY_CHECKS = 1;
