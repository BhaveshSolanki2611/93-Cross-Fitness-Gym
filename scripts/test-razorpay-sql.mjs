// Validates the recordRazorpaySubscriptionPayment SQL against the live DB
// inside a transaction that is ALWAYS rolled back — no data is persisted.
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

  // Fixture member + plan
  const m = await client.query(
    `insert into public.members (full_name, phone) values ('RZP SQL TEST', '0000000000') returning id`
  );
  const memberId = m.rows[0].id;
  const p = await client.query(`select id from public.membership_plans where slug='pro'`);
  const planId = p.rows[0].id;

  const insertPayment = `
    insert into public.payments
      (member_id, amount, currency, method, status,
       razorpay_order_id, razorpay_payment_id, razorpay_signature)
    values ($1, $2, 'INR', 'razorpay', 'paid', $3, $4, $5)
    on conflict (razorpay_payment_id) where razorpay_payment_id is not null do nothing
    returning id`;

  // 1st insert → row
  const pay1 = await client.query(insertPayment, [memberId, 2499, "order_TEST1", "pay_TEST1", "sig"]);
  console.log("first insert rowCount =", pay1.rowCount, "(expect 1)");

  // 2nd identical insert → conflict, no row (idempotency)
  const pay2 = await client.query(insertPayment, [memberId, 2499, "order_TEST1", "pay_TEST1", "sig"]);
  console.log("duplicate insert rowCount =", pay2.rowCount, "(expect 0)");

  // Subscription extension statement
  const sub = await client.query(
    `insert into public.member_subscriptions
       (member_id, plan_id, term, start_date, end_date, amount, status)
     select
       $1, $2, $3::sub_term,
       current_date,
       greatest(
         current_date,
         coalesce(
           (select max(end_date) from public.member_subscriptions
             where member_id = $1 and status = 'active'),
           current_date
         )
       ) + ($4 || ' months')::interval,
       $5, 'active'
     returning id, end_date`,
    [memberId, planId, "monthly", "1", 2499]
  );
  console.log("subscription created, end_date =", sub.rows[0].end_date, "(expect ~1 month out)");

  // Renewal before expiry should extend from the existing end_date, not today.
  const sub2 = await client.query(
    `insert into public.member_subscriptions
       (member_id, plan_id, term, start_date, end_date, amount, status)
     select
       $1, $2, $3::sub_term,
       current_date,
       greatest(
         current_date,
         coalesce(
           (select max(end_date) from public.member_subscriptions
             where member_id = $1 and status = 'active'),
           current_date
         )
       ) + ($4 || ' months')::interval,
       $5, 'active'
     returning end_date`,
    [memberId, planId, "monthly", "1", 2499]
  );
  console.log("stacked renewal end_date =", sub2.rows[0].end_date, "(expect ~2 months out)");

  await client.query(
    `update public.payments set subscription_id = $1 where id = $2`,
    [sub.rows[0].id, pay1.rows[0].id]
  );
  await client.query(
    `update public.members set status = 'active' where id = $1 and status <> 'active'`,
    [memberId]
  );
  console.log("linked payment + member status statements OK");

  console.log("ALL SQL VALID ✅ — rolling back (nothing persisted)");
} finally {
  await client.query("rollback");
  await client.end();
}
