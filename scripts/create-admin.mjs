// Creates (or repairs) the admin auth user and promotes it to super_admin.
// Reads env from .env.local. Idempotent: safe to re-run.
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

function loadEnv() {
  const p = path.resolve(process.cwd(), ".env.local");
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
        v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SEC = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EMAIL = "admin@93crossfitness.com";
const PASSWORD = "Admin93CF!2026";

async function api(pathname, opts = {}) {
  const res = await fetch(`${URL}${pathname}`, {
    ...opts,
    headers: {
      apikey: SEC,
      Authorization: `Bearer ${SEC}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  let body;
  try { body = await res.json(); } catch { body = {}; }
  return { status: res.status, body };
}

// 1. Create user (or find existing)
let { status, body } = await api("/auth/v1/admin/users", {
  method: "POST",
  body: JSON.stringify({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Gym Admin" },
  }),
});
let userId = body.id;
if (!userId) {
  // Maybe already exists — look it up
  const list = await api(`/auth/v1/admin/users?page=1&per_page=50`);
  const found = (list.body.users || []).find((u) => u.email === EMAIL);
  if (found) {
    userId = found.id;
    console.log("User already existed:", userId);
    // ensure password + confirmation
    await api(`/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ password: PASSWORD, email_confirm: true }),
    });
  } else {
    console.error("CREATE FAILED:", status, JSON.stringify(body).slice(0, 300));
    process.exit(1);
  }
} else {
  console.log("User created:", userId);
}

// 2. Promote to super_admin via direct SQL (profiles row created by trigger)
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
const upd = await client.query(
  `insert into public.profiles (id, email, full_name, role)
   values ($1, $2, 'Gym Admin', 'super_admin')
   on conflict (id) do update set role='super_admin', email=$2
   returning email, role`,
  [userId, EMAIL]
);
console.log("PROFILE:", JSON.stringify(upd.rows[0]));
await client.end();

// 3. Verify real login with the anon/publishable key
const login = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: ANON, "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const lj = await login.json();
console.log("LOGIN:", login.status, lj.access_token ? "TOKEN ISSUED" : JSON.stringify(lj).slice(0, 200));

if (lj.access_token) {
  const p = await fetch(`${URL}/rest/v1/profiles?select=email,role`, {
    headers: { apikey: ANON, Authorization: `Bearer ${lj.access_token}` },
  });
  console.log("RLS PROFILE:", await p.text());
}
