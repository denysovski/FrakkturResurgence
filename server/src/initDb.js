import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, query } from "./db.js";
import { CATEGORIES, randomSizesForProduct } from "./seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categoryTableMap = {
  tshirts: "tshirts",
  hoodies: "hoodies",
  caps: "caps",
  belts: "belts",
  pants: "pants",
  knitwear: "knitwear",
  "leather-jackets": "leather_jackets",
};

export const initDb = async () => {
  const schemaPath = path.resolve(__dirname, "../sql/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const connection = await pool.getConnection();

  try {
    const statements = schemaSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }

  for (const category of CATEGORIES) {
    await query(
      `INSERT INTO categories (slug, title)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title)`,
      [category.slug, category.title],
    );

    const categoryRows = await query(`SELECT id FROM categories WHERE slug = ? LIMIT 1`, [category.slug]);
    const categoryId = categoryRows[0].id;

    for (let index = 0; index < category.names.length; index += 1) {
      const productCode = `${category.codesPrefix}${index + 1}`;
      const priceCents = Number(category.prices[index] || category.prices.at(-1) || 0) * 100;

      await query(
        `INSERT INTO products (category_id, product_code, name, description, material, sustainability, price_cents, image_key, has_sizes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           material = VALUES(material),
           sustainability = VALUES(sustainability),
           price_cents = VALUES(price_cents),
           has_sizes = VALUES(has_sizes),
           is_active = 1`,
        [
          categoryId,
          productCode,
          category.names[index],
          category.description,
          category.material,
          category.sustainability,
          priceCents,
          productCode,
          category.hasSizes ? 1 : 0,
        ],
      );

      const productRows = await query(`SELECT id FROM products WHERE product_code = ? LIMIT 1`, [productCode]);
      const productId = productRows[0].id;

      const specificTable = categoryTableMap[category.slug];
      if (specificTable) {
        await query(`INSERT IGNORE INTO ${specificTable} (product_id) VALUES (?)`, [productId]);
      }

      await query(`DELETE FROM product_sizes WHERE product_id = ?`, [productId]);

      if (category.hasSizes) {
        const sizes = randomSizesForProduct();
        for (const sizeCode of sizes) {
          const stock = Math.floor(Math.random() * 40) + 1;
          await query(
            `INSERT INTO product_sizes (product_id, size_code, stock) VALUES (?, ?, ?)`,
            [productId, sizeCode, stock],
          );
        }
      } else {
        const stock = Math.floor(Math.random() * 60) + 1;
        await query(
          `INSERT INTO product_sizes (product_id, size_code, stock) VALUES (?, 'UNI', ?)`,
          [productId, stock],
        );
      }
    }
  }
};
