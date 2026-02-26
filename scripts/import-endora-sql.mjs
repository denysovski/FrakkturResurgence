import fs from "node:fs";
import path from "node:path";
import mysql from "../server/node_modules/mysql2/promise.js";

const envPath = path.join(process.cwd(), "server", ".env");
const sqlPath = path.join(process.cwd(), "server", "sql", "FULL_IMPORT_ENDORA_SHARED.sql");

if (!fs.existsSync(envPath)) {
  throw new Error("Missing server/.env file with DB credentials.");
}

if (!fs.existsSync(sqlPath)) {
  throw new Error("Missing SQL file: server/sql/FULL_IMPORT_ENDORA_SHARED.sql");
}

const env = {};
for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const idx = line.indexOf("=");
  if (idx < 0) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  env[key] = value;
}

const host = env.DB_HOST;
const user = env.DB_USER;
const password = env.DB_PASSWORD;
const database = env.DB_NAME;
const port = Number(env.DB_PORT || 3306);

if (!host || !user || !password || !database) {
  throw new Error("DB_HOST, DB_USER, DB_PASSWORD, DB_NAME are required in server/.env");
}

const sql = fs.readFileSync(sqlPath, "utf8");

const conn = await mysql.createConnection({
  host,
  port,
  user,
  password,
  database,
  multipleStatements: true,
});

try {
  await conn.query(sql);
  console.log("Endora import completed successfully.");
} finally {
  await conn.end();
}
