import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import {
  RevenueChart,
  MembersChart,
  PlanMixChart,
} from "@/components/admin/report-charts";

export default async function AdminReports() {
  await requireStaff();

  // Last 6 months revenue vs expenses
  const monthly = await query<{
    month: string;
    revenue: string;
    expenses: string;
  }>(`
    with months as (
      select date_trunc('month', now()) - (interval '1 month' * g) as m
      from generate_series(5, 0, -1) g
    )
    select to_char(m, 'Mon') as month,
      coalesce((select sum(amount) from payments
        where status='paid' and date_trunc('month', coalesce(paid_at, created_at)) = m), 0)::text as revenue,
      coalesce((select sum(amount) from expenses
        where date_trunc('month', spent_on) = m), 0)::text as expenses
    from months order by m
  `);

  // New members per month
  const joins = await query<{ month: string; joined: string }>(`
    with months as (
      select date_trunc('month', now()) - (interval '1 month' * g) as m
      from generate_series(5, 0, -1) g
    )
    select to_char(m, 'Mon') as month,
      (select count(*) from members where date_trunc('month', join_date) = m)::text as joined
    from months order by m
  `);

  // Active plan mix
  const planMix = await query<{ name: string; value: string }>(`
    select p.name, count(*)::text as value
    from member_subscriptions s
    join membership_plans p on p.id = s.plan_id
    where s.status = 'active'
    group by p.name order by count(*) desc
  `);

  // Headline aggregates
  const [agg] = await query<{
    revenue_ytd: string | null;
    expenses_ytd: string | null;
    active_members: string;
    active_subs: string;
    avg_ticket: string | null;
  }>(`
    select
      (select sum(amount) from payments where status='paid'
        and date_trunc('year', coalesce(paid_at, created_at)) = date_trunc('year', now()))::text as revenue_ytd,
      (select sum(amount) from expenses
        where date_trunc('year', spent_on) = date_trunc('year', now()))::text as expenses_ytd,
      (select count(*) from members where status='active')::text as active_members,
      (select count(*) from member_subscriptions where status='active')::text as active_subs,
      (select avg(amount) from payments where status='paid')::text as avg_ticket
  `);

  const revenueYtd = Number(agg?.revenue_ytd ?? 0);
  const expensesYtd = Number(agg?.expenses_ytd ?? 0);
  const profit = revenueYtd - expensesYtd;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Reports</h1>
        <p className="mt-1 text-muted">Revenue, growth and plan performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Revenue (YTD)" value={formatINR(revenueYtd)} />
        <Kpi label="Expenses (YTD)" value={formatINR(expensesYtd)} tone="ember" />
        <Kpi
          label="Net (YTD)"
          value={formatINR(profit)}
          tone={profit >= 0 ? "volt" : "ember"}
        />
        <Kpi
          label="Avg payment"
          value={agg?.avg_ticket ? formatINR(Number(agg.avg_ticket)) : "—"}
        />
      </div>

      <section className="rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="mb-4 text-lg">Revenue vs expenses (6 months)</h2>
        <RevenueChart
          data={monthly.map((m) => ({
            month: m.month,
            revenue: Number(m.revenue),
            expenses: Number(m.expenses),
          }))}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-border bg-surface/60 p-6">
          <h2 className="mb-4 text-lg">New members</h2>
          <MembersChart
            data={joins.map((j) => ({ month: j.month, joined: Number(j.joined) }))}
          />
        </section>

        <section className="rounded-3xl border border-border bg-surface/60 p-6">
          <h2 className="mb-4 text-lg">Active plan mix</h2>
          {planMix.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">
              No active subscriptions yet.
            </p>
          ) : (
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
              <PlanMixChart
                data={planMix.map((p) => ({ name: p.name, value: Number(p.value) }))}
              />
              <ul className="flex flex-col gap-2 text-sm">
                {planMix.map((p) => (
                  <li key={p.name} className="flex items-center justify-between gap-6">
                    <span className="text-muted">{p.name}</span>
                    <span className="font-semibold">{p.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "volt" | "ember";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="text-xs uppercase tracking-widest text-muted-2">{label}</div>
      <div
        className={`mt-2 font-display text-3xl ${
          tone === "volt" ? "text-primary" : tone === "ember" ? "text-ember" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
