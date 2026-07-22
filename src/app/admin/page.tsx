import Link from "next/link";
import { Users, TrendingUp, AlertTriangle, CalendarCheck, MessagesSquare, Footprints } from "lucide-react";
import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { formatINR } from "@/lib/utils";

/**
 * Admin dashboard. Layout guard verifies staff; aggregates run over the
 * server-only pool (query shapes fully server-controlled, no user input).
 */
export default async function AdminDashboard() {
  await requireStaff();

  const [kpis] = await query<{
    active_members: string;
    expiring_7d: string;
    revenue_month: string | null;
    pending_bookings: string;
    new_leads: string;
    checkins_today: string;
  }>(`
    select
      (select count(*) from members where status = 'active') as active_members,
      (select count(*) from member_subscriptions
        where status = 'active'
          and end_date between current_date and current_date + 7) as expiring_7d,
      (select sum(amount) from payments
        where status = 'paid'
          and date_trunc('month', coalesce(paid_at, created_at)) = date_trunc('month', now())) as revenue_month,
      (select count(*) from bookings where status = 'pending') as pending_bookings,
      (select count(*) from leads where status = 'new') as new_leads,
      (select count(*) from attendance where check_in::date = current_date) as checkins_today
  `);

  const recentBookings = await query<{
    id: string;
    name: string;
    phone: string;
    type: string;
    status: string;
    created_at: string;
  }>(
    `select id, name, phone, type::text, status::text, created_at
     from bookings order by created_at desc limit 6`
  );

  const recentLeads = await query<{
    id: string;
    name: string;
    interest: string | null;
    status: string;
    created_at: string;
  }>(
    `select id, name, interest, status::text, created_at
     from leads order by created_at desc limit 6`
  );

  const cards = [
    { icon: Users, label: "Active members", value: kpis.active_members, href: "/admin/members" },
    { icon: AlertTriangle, label: "Expiring in 7 days", value: kpis.expiring_7d, href: "/admin/members", warn: Number(kpis.expiring_7d) > 0 },
    { icon: TrendingUp, label: "Revenue this month", value: formatINR(Number(kpis.revenue_month ?? 0)), href: "/admin/payments" },
    { icon: CalendarCheck, label: "Pending bookings", value: kpis.pending_bookings, href: "/admin/bookings", warn: Number(kpis.pending_bookings) > 0 },
    { icon: MessagesSquare, label: "New leads", value: kpis.new_leads, href: "/admin/leads", warn: Number(kpis.new_leads) > 0 },
    { icon: Footprints, label: "Check-ins today", value: kpis.checkins_today, href: "/admin/members" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">Dashboard</h1>
        <p className="mt-1 text-muted">Today at 93 Cross Fitness.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-2xl border border-border bg-surface/60 p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-2">
              <c.icon className={`size-4 ${c.warn ? "text-ember" : "text-primary"}`} />
              {c.label}
            </div>
            <div className={`mt-2 font-display text-3xl ${c.warn ? "text-ember" : ""}`}>
              {c.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-border bg-surface/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl">Latest bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {recentBookings.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-2">
                      {b.type.replace(/_/g, " ")} · {b.phone}
                    </div>
                  </div>
                  <StatusPill status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-surface/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl">Latest leads</h2>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted">No leads yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {recentLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-2">{l.interest ?? "General"}</div>
                  </div>
                  <StatusPill status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "confirmed" || status === "converted" || status === "completed"
      ? "bg-primary/10 text-primary"
      : status === "pending" || status === "new"
        ? "bg-ember/10 text-ember"
        : "bg-surface-2 text-muted";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
