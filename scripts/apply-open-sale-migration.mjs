/**
 * Apply supabase/migrations/040_open_sale.sql
 *
 * Needs one of:
 *   DATABASE_URL / SUPABASE_DB_URL / DIRECT_URL
 *   or SUPABASE_DB_PASSWORD (+ VITE_SUPABASE_URL project ref)
 *
 * Usage:
 *   node scripts/apply-open-sale-migration.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split("\n")
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        let v = l.slice(i + 1).trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        return [l.slice(0, i).trim(), v];
      }),
  );
}

function resolveDbUrl(env) {
  const direct =
    env.DATABASE_URL ||
    env.SUPABASE_DB_URL ||
    env.DIRECT_URL ||
    env.POSTGRES_URL ||
    "";
  if (direct) return direct;

  const password = env.SUPABASE_DB_PASSWORD || env.POSTGRES_PASSWORD || "";
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "";
  const ref = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!password || !ref) return "";

  // Direct connection (DDL-friendly)
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(root, ".env.local")),
    ...process.env,
  };
  const dbUrl = resolveDbUrl(env);
  if (!dbUrl) {
    console.error(
      JSON.stringify({
        ok: false,
        reason:
          "Need DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local (service_role cannot run DDL).",
      }),
    );
    process.exit(2);
  }

  const sqlPath = path.join(root, "supabase/migrations/040_open_sale.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    const check = await client.query(
      "select to_regclass('public.open_sale_events') as events, to_regclass('public.place_open_sale_bid') as bid_fn",
    );
    console.log(
      JSON.stringify({
        ok: true,
        open_sale_events: check.rows[0]?.events,
        place_open_sale_bid: check.rows[0]?.bid_fn,
      }),
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }));
  process.exit(1);
});
