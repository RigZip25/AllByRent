/**
 * Apply supabase/migrations/041_rental_agreement.sql
 *
 * Needs DATABASE_URL / SUPABASE_DB_URL / DIRECT_URL
 * or SUPABASE_DB_PASSWORD (+ VITE_SUPABASE_URL project ref)
 *
 * Usage:
 *   node scripts/apply-rental-agreement-migration.mjs
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

  const sqlPath = path.join(root, "supabase/migrations/041_rental_agreement.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    const probe = await client.query(
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name = 'rentals'
         and column_name = 'rental_agreement'`,
    );
    console.log(JSON.stringify({ ok: true, columns: probe.rows }));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
