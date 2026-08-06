const fs = require("fs");

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log(
    JSON.stringify({
      urlOk: Boolean(url),
      keyLen: key ? key.length : 0,
      envCount: Object.keys(process.env).filter((k) => !k.startsWith("npm_")).length,
    }),
  );
  if (!url || !key) process.exit(2);

  const sql = fs.readFileSync("supabase/migrations/033_rental_handoff_sides.sql", "utf8");
  const probe = await fetch(`${url}/rest/v1/rentals?select=host_handed_over_at&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const probeText = await probe.text();
  console.log("probe_before", probe.status, probeText.slice(0, 200));
  if (probe.status === 200) {
    console.log("columns_already_exist");
    return;
  }

  // Prefer Database API via supabase-js raw if available later.
  // Attempt known RPC helpers first.
  for (const name of ["exec_sql", "sql", "execute_sql"]) {
    const res = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql, sql }),
    });
    console.log("rpc", name, res.status, (await res.text()).slice(0, 180));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
