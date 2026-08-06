const fs = require("fs");

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(
    JSON.stringify({
      urlOk: Boolean(url),
      keyLen: key ? key.length : 0,
    }),
  );
  if (!url || !key) process.exit(2);

  const sql = fs.readFileSync("supabase/migrations/033_rental_handoff_sides.sql", "utf8");
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  const probe = await fetch(`${url}/rest/v1/rentals?select=host_handed_over_at&limit=1`, {
    headers,
  });
  const probeText = await probe.text();
  console.log("probe_before", probe.status, probeText.slice(0, 220));
  if (probe.status === 200) {
    console.log("columns_already_exist");
    return;
  }

  // No public DDL endpoint with service role alone. Try installing pg against
  // SUPABASE_DB_URL / DATABASE_URL if present in the environment.
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DIRECT_URL ||
    "";
  console.log("dbUrl_present", Boolean(dbUrl), "dbUrl_len", dbUrl.length);

  if (dbUrl) {
    const pg = await import("pg").catch(() => null);
    if (!pg) {
      console.log("pg_module_missing");
      process.exit(4);
    }
    const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(sql);
    await client.end();
    const probe2 = await fetch(`${url}/rest/v1/rentals?select=host_handed_over_at&limit=1`, {
      headers,
    });
    console.log("probe_after", probe2.status, (await probe2.text()).slice(0, 180));
    return;
  }

  console.log("NO_DB_URL_CANNOT_DDL");
  process.exit(3);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
