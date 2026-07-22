// Minimal DB runner (no psql available). Reads DATABASE_URL from .env.local.
// Usage:
//   node scripts/db.mjs --check                 # connectivity test
//   node scripts/db.mjs --file path/to.sql      # run a .sql file (single transaction)
//   node scripts/db.mjs --sql "select 1"        # run an inline statement
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

function loadEnv() {
  const p = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m) {
        let v = m[2].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        )
          v = v.slice(1, -1);
        if (!process.env[m[1]]) process.env[m[1]] = v;
      }
    }
  }
}

async function main() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    if (args[0] === "--check") {
      const r = await client.query("select version(), current_database(), now()");
      console.log("CONNECTED:", r.rows[0].current_database);
      console.log(r.rows[0].version.split(",")[0]);
    } else if (args[0] === "--file") {
      const sql = fs.readFileSync(path.resolve(args[1]), "utf8");
      await client.query("begin");
      await client.query(sql);
      await client.query("commit");
      console.log("OK: applied", args[1]);
    } else if (args[0] === "--sql") {
      const r = await client.query(args[1]);
      console.log(JSON.stringify(r.rows, null, 2));
    } else {
      console.error("Unknown command. Use --check | --file <path> | --sql <stmt>");
      process.exit(1);
    }
  } catch (e) {
    try {
      await client.query("rollback");
    } catch {}
    console.error("DB ERROR:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
