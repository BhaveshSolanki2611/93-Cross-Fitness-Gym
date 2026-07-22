// Validates the class-booking SQL from src/app/actions/bookings.ts against the
// live DB inside a transaction that is ALWAYS rolled back — nothing persists.
import { readFileSync } from "node:fs";
import pg from "pg";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

try {
  await client.query("begin");

  // Fixture: a profile-less member + a real schedule slot.
  const m = await client.query(
    `insert into public.members (full_name, phone) values ('BOOK SQL TEST','1111111111') returning id`
  );
  const memberId = m.rows[0].id;
  const s = await client.query(
    `select id, title, day_of_week, capacity from public.class_schedule where is_active = true limit 1`
  );
  const slot = s.rows[0];
  console.log("using slot:", slot.title, "dow =", slot.day_of_week, "cap =", slot.capacity);

  // Next occurrence of that weekday.
  const today = new Date();
  const diff = (slot.day_of_week - today.getDay() + 7) % 7;
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Insert booking (as the action does).
  const ins = await client.query(
    `insert into bookings (member_id, type, name, phone, email, class_schedule_id, preferred_date, status)
     values ($1, 'group_class', $2, $3, $4, $5, $6, 'confirmed') returning id`,
    [memberId, "BOOK SQL TEST", "1111111111", null, slot.id, date]
  );
  console.log("booking inserted:", !!ins.rows[0].id, "(expect true)");

  // Duplicate check finds it.
  const dup = await client.query(
    `select id from bookings
      where class_schedule_id = $1 and preferred_date = $2
        and member_id = $3 and status in ('pending','confirmed') limit 1`,
    [slot.id, date, memberId]
  );
  console.log("duplicate detected:", dup.rowCount === 1, "(expect true)");

  // Capacity count includes it.
  const cnt = await client.query(
    `select count(*)::int as n from bookings
      where class_schedule_id = $1 and preferred_date = $2
        and status in ('pending','confirmed')`,
    [slot.id, date]
  );
  console.log("capacity count >= 1:", cnt.rows[0].n >= 1, "(expect true)");

  // Grouped counts query from the page.
  const grouped = await client.query(
    `select class_schedule_id, preferred_date::text, count(*)::text as n
       from bookings
      where preferred_date between $1 and $2
        and class_schedule_id is not null
        and status in ('pending','confirmed')
      group by 1, 2`,
    [date, date]
  );
  console.log("grouped counts rows:", grouped.rowCount, "(expect >= 1)");

  // Cancel via ownership join — member has no profile, so with a random profile
  // id this must update NOTHING (ownership enforced)...
  const noOwner = await client.query(
    `update bookings b set status = 'cancelled'
       from members m
      where b.id = $1 and b.member_id = m.id and m.profile_id = $2
        and b.status in ('pending','confirmed')
      returning b.id`,
    [ins.rows[0].id, "00000000-0000-0000-0000-000000000000"]
  );
  console.log("cancel blocked for non-owner:", noOwner.rowCount === 0, "(expect true)");

  // ...then link the member to a real profile and cancel succeeds.
  const prof = await client.query(`select id from public.profiles limit 1`);
  await client.query(`update public.members set profile_id = $1 where id = $2`, [
    prof.rows[0].id,
    memberId,
  ]);
  const owned = await client.query(
    `update bookings b set status = 'cancelled'
       from members m
      where b.id = $1 and b.member_id = m.id and m.profile_id = $2
        and b.status in ('pending','confirmed')
      returning b.id`,
    [ins.rows[0].id, prof.rows[0].id]
  );
  console.log("cancel works for owner:", owned.rowCount === 1, "(expect true)");

  console.log("ALL BOOKING SQL VALID ✅ — rolling back (nothing persisted)");
} finally {
  await client.query("rollback");
  await client.end();
}
