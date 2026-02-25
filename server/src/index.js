import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { initDb } from "./initDb.js";
import { query } from "./db.js";
import { requireAuth, signAuthToken } from "./auth.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

app.disable("x-powered-by");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === CLIENT_ORIGIN) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin denied"));
    },
    credentials: false,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "20kb" }));

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_RE = /^[a-zA-ZÀ-ž' -]{2,120}$/;
const PASSWORD_POLICY_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;
const CATEGORY_RE = /^[a-z-]{2,40}$/;
const PRODUCT_CODE_RE = /^[a-zA-Z0-9-]{1,40}$/;
const SIZE_RE = /^[A-Z0-9-]{1,16}$/;

const rateState = new Map();
const nowMs = () => Date.now();

setInterval(() => {
  const now = nowMs();
  for (const [key, bucket] of rateState.entries()) {
    if (bucket.resetAt <= now) {
      rateState.delete(key);
    }
  }
}, 60_000).unref();

const createRateLimiter = ({ name, windowMs, maxHits }) =>
  (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${name}:${ip}`;
    const now = nowMs();
    const bucket = rateState.get(key);

    if (!bucket || bucket.resetAt <= now) {
      rateState.set(key, { hits: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.hits += 1;
    if (bucket.hits > maxHits) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    return next();
  };

const authLimiter = createRateLimiter({ name: "auth", windowMs: 15 * 60 * 1000, maxHits: 25 });
const writeLimiter = createRateLimiter({ name: "write", windowMs: 60 * 1000, maxHits: 120 });

const formatPrice = (priceCents) => `€${(Number(priceCents) / 100).toFixed(2)}`;
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const safeText = (value, maxLen = 255) => String(value || "").trim().slice(0, maxLen);

const normalizeSize = (value) => safeText(value, 16).toUpperCase();
const normalizeCategory = (value) => safeText(value, 40).toLowerCase();
const normalizeProductCode = (value) => safeText(value, 40);

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const mapProductRow = (row) => ({
  dbId: row.id,
  id: row.product_code,
  categoryKey: row.category_slug,
  categoryTitle: row.category_title,
  name: row.name,
  price: formatPrice(row.price_cents),
  description: row.description,
  material: row.material,
  sustainability: row.sustainability,
  imageKey: row.image_key,
  sizes: row.sizes_csv ? row.sizes_csv.split(",") : [],
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const fullName = safeText(req.body.fullName, 120);
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (fullName.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }

    if (!NAME_RE.test(fullName)) {
      return res.status(400).json({ error: "Name contains invalid characters." });
    }

    if (!PASSWORD_POLICY_RE.test(password)) {
      return res.status(400).json({
        error: "Password must be 8-72 characters and include 1 uppercase letter, 1 number, and 1 special character.",
      });
    }

    const existingRows = await query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email]);
    if (existingRows.length) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertResult = await query(
      `INSERT INTO users (email, full_name, password_hash, status) VALUES (?, ?, ?, 'active')`,
      [email, fullName, passwordHash],
    );

    const token = signAuthToken({ userId: insertResult.insertId, email });

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: insertResult.insertId,
        email,
        fullName,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Register error");
    return res.status(500).json({ error: "Failed to register user." });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!EMAIL_RE.test(email) || password.length < 8 || password.length > 72) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const rows = await query(`SELECT id, email, full_name, password_hash, status FROM users WHERE email = ? LIMIT 1`, [email]);
    if (!rows.length) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signAuthToken({ userId: user.id, email: user.email });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error");
    return res.status(500).json({ error: "Failed to login." });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const rows = await query(`SELECT id, email, full_name, status FROM users WHERE id = ? LIMIT 1`, [req.user.userId]);
  if (!rows.length) {
    return res.status(404).json({ error: "User not found." });
  }

  const user = rows[0];
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      status: user.status,
    },
  });
});

app.get("/api/categories/:slug/products", async (req, res) => {
  const slug = normalizeCategory(req.params.slug);
  if (!CATEGORY_RE.test(slug)) {
    return res.status(400).json({ error: "Invalid category." });
  }

  const rows = await query(
    `SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
            c.slug AS category_slug, c.title AS category_title,
            GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
     WHERE c.slug = ? AND p.is_active = 1
     GROUP BY p.id, c.slug, c.title
     ORDER BY p.product_code ASC`,
    [slug],
  );

  return res.json({ products: rows.map(mapProductRow) });
});

app.get("/api/products/:categoryKey/:productCode", async (req, res) => {
  const categoryKey = normalizeCategory(req.params.categoryKey);
  const productCode = normalizeProductCode(req.params.productCode);

  if (!CATEGORY_RE.test(categoryKey) || !PRODUCT_CODE_RE.test(productCode)) {
    return res.status(400).json({ error: "Invalid product reference." });
  }

  const rows = await query(
    `SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
            c.slug AS category_slug, c.title AS category_title,
            GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
     WHERE c.slug = ? AND p.product_code = ? AND p.is_active = 1
     GROUP BY p.id, c.slug, c.title
     LIMIT 1`,
    [categoryKey, productCode],
  );

  if (!rows.length) {
    return res.status(404).json({ error: "Product not found." });
  }

  return res.json({ product: mapProductRow(rows[0]) });
});

app.get("/api/search", async (req, res) => {
  const q = safeText(req.query.q, 120);
  if (!q) {
    return res.json({ products: [] });
  }

  const like = `%${q}%`;
  const rows = await query(
    `SELECT p.id, p.product_code, p.name, p.description, p.material, p.sustainability, p.price_cents, p.image_key,
            c.slug AS category_slug, c.title AS category_title,
            GROUP_CONCAT(ps.size_code ORDER BY FIELD(ps.size_code,'XS','S','M','L','XL','XXL','UNI')) AS sizes_csv
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_sizes ps ON ps.product_id = p.id AND ps.stock > 0
     WHERE p.is_active = 1 AND (p.name LIKE ? OR c.title LIKE ?)
     GROUP BY p.id, c.slug, c.title
     ORDER BY p.product_code ASC`,
    [like, like],
  );

  return res.json({ products: rows.map(mapProductRow) });
});

app.get("/api/cart", requireAuth, async (req, res) => {
  const rows = await query(
    `SELECT ci.id, ci.quantity, ci.size_code,
            p.id AS product_id, p.product_code, p.name, p.price_cents, p.image_key,
            c.slug AS category_slug, c.title AS category_title
     FROM cart_items ci
     INNER JOIN products p ON p.id = ci.product_id
     INNER JOIN categories c ON c.id = p.category_id
     WHERE ci.user_id = ?
     ORDER BY ci.updated_at DESC`,
    [req.user.userId],
  );

  const items = rows.map((row) => ({
    key: String(row.id),
    id: row.product_code,
    dbProductId: row.product_id,
    categoryKey: row.category_slug,
    categoryTitle: row.category_title,
    name: row.name,
    price: formatPrice(row.price_cents),
    image: row.image_key || "",
    size: row.size_code || "UNI",
    quantity: row.quantity,
  }));

  return res.json({ items });
});

app.post("/api/cart/items", requireAuth, writeLimiter, async (req, res) => {
  const categoryKey = normalizeCategory(req.body.categoryKey);
  const productCode = normalizeProductCode(req.body.productCode);
  const size = normalizeSize(req.body.size || "UNI");
  const qty = parsePositiveInt(req.body.quantity || 1);

  if (!CATEGORY_RE.test(categoryKey) || !PRODUCT_CODE_RE.test(productCode) || !SIZE_RE.test(size) || !qty || qty > 20) {
    return res.status(400).json({ error: "Invalid cart payload." });
  }

  const productRows = await query(
    `SELECT p.id
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE c.slug = ? AND p.product_code = ? AND p.is_active = 1
     LIMIT 1`,
    [categoryKey, productCode],
  );

  if (!productRows.length) {
    return res.status(404).json({ error: "Product not found." });
  }

  const productId = productRows[0].id;

  const stockRows = await query(
    `SELECT stock FROM product_sizes WHERE product_id = ? AND size_code = ? LIMIT 1`,
    [productId, size],
  );

  if (!stockRows.length || Number(stockRows[0].stock) <= 0) {
    return res.status(400).json({ error: "Selected size is unavailable." });
  }

  await query(
    `INSERT INTO cart_items (user_id, product_id, size_code, quantity)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP`,
    [req.user.userId, productId, size, qty],
  );

  return res.json({ message: "Item added to cart." });
});

app.patch("/api/cart/items/:cartItemId", requireAuth, async (req, res) => {
  const cartItemId = parsePositiveInt(req.params.cartItemId);
  const quantity = Number(req.body.quantity || 0);

  if (!cartItemId || !Number.isInteger(quantity) || quantity < 0 || quantity > 20) {
    return res.status(400).json({ error: "Invalid cart update payload." });
  }

  if (quantity <= 0) {
    await query(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`, [cartItemId, req.user.userId]);
    return res.json({ message: "Item removed." });
  }

  await query(
    `UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
    [quantity, cartItemId, req.user.userId],
  );

  return res.json({ message: "Quantity updated." });
});

app.delete("/api/cart/items/:cartItemId", requireAuth, writeLimiter, async (req, res) => {
  const cartItemId = parsePositiveInt(req.params.cartItemId);
  if (!cartItemId) {
    return res.status(400).json({ error: "Invalid cart item id." });
  }
  await query(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`, [cartItemId, req.user.userId]);
  return res.json({ message: "Item removed." });
});

app.get("/api/wishlist", requireAuth, async (req, res) => {
  const rows = await query(
    `SELECT w.id, p.product_code, p.name, p.price_cents, p.image_key,
            c.slug AS category_slug, c.title AS category_title
     FROM wishlist_items w
     INNER JOIN products p ON p.id = w.product_id
     INNER JOIN categories c ON c.id = p.category_id
     WHERE w.user_id = ?
     ORDER BY w.created_at DESC`,
    [req.user.userId],
  );

  const items = rows.map((row) => ({
    key: String(row.id),
    id: row.product_code,
    categoryKey: row.category_slug,
    categoryTitle: row.category_title,
    name: row.name,
    price: formatPrice(row.price_cents),
    image: row.image_key || "",
  }));

  return res.json({ items });
});

app.post("/api/wishlist/items", requireAuth, writeLimiter, async (req, res) => {
  const categoryKey = normalizeCategory(req.body.categoryKey);
  const productCode = normalizeProductCode(req.body.productCode);

  if (!CATEGORY_RE.test(categoryKey) || !PRODUCT_CODE_RE.test(productCode)) {
    return res.status(400).json({ error: "Invalid wishlist payload." });
  }

  const countRows = await query(`SELECT COUNT(*) AS total FROM wishlist_items WHERE user_id = ?`, [req.user.userId]);
  if (Number(countRows[0].total) >= 50) {
    return res.status(400).json({ error: "Wishlist limit reached (50 items)." });
  }

  const productRows = await query(
    `SELECT p.id
     FROM products p
     INNER JOIN categories c ON c.id = p.category_id
     WHERE c.slug = ? AND p.product_code = ? AND p.is_active = 1
     LIMIT 1`,
    [categoryKey, productCode],
  );

  if (!productRows.length) {
    return res.status(404).json({ error: "Product not found." });
  }

  await query(
    `INSERT IGNORE INTO wishlist_items (user_id, product_id) VALUES (?, ?)`,
    [req.user.userId, productRows[0].id],
  );

  return res.json({ message: "Added to wishlist." });
});

app.delete("/api/wishlist/items/:wishlistItemId", requireAuth, writeLimiter, async (req, res) => {
  const wishlistItemId = parsePositiveInt(req.params.wishlistItemId);
  if (!wishlistItemId) {
    return res.status(400).json({ error: "Invalid wishlist item id." });
  }
  await query(`DELETE FROM wishlist_items WHERE id = ? AND user_id = ?`, [wishlistItemId, req.user.userId]);
  return res.json({ message: "Removed from wishlist." });
});

app.use((error, _req, res, next) => {
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Payload too large." });
  }
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON body." });
  }
  if (error?.message === "CORS origin denied") {
    return res.status(403).json({ error: "Origin not allowed." });
  }
  return next(error);
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

const start = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Frakktur API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    process.exit(1);
  }
};

start().catch(() => {
  console.error("Unhandled start error");
  process.exit(1);
});
