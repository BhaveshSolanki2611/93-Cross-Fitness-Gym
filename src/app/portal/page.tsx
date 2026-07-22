import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, AlertTriangle, CalendarDays, CreditCard, Dumbbell, ArrowRight } from "lucide-react";
import { getSupabaseServer, getUserProfile } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";

export default async function PortalOverview() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal");
  const supabase = (await getSupabaseServer())!;

  // Member record(s) linked to this login (RLS restricts to own rows).
  const { data: members } = await supabase
    .from("members")
    .select("id, member_code, full_name, status, join_date")
    .order("created_at", { ascending: true });
  const member = members?.[0] ?? null;

  type ActiveSub = {
    end_date: string;
    start_date: string;
    status: string;
    amount: number;
    membership_plans: { name: string } | null;
  };
  let sub: ActiveSub | null = null;
  let payments: { amount: number; paid_at: string | null; status: string; invoice_no: string | null }[] = [];
  let attendanceCount = 0;

  if (member) {
    const [subRes, payRes, attRes] = await Promise.all([
      supabase
        .from("member_subscriptions")
        .select("end_date, start_date, status, amount, membership_plans(name)")
        .eq("member_id", member.id)
        .eq("status", "active")
        .order("end_date", { ascending: false })
        .limit(1),
      supabase
        .from("payments")
        .select("amount, paid_at, status, invoice_no")
        .eq("member_id", member.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("attendance")
        .select("id", { count: "exact", head: true })
        .eq("member_id", member.id),
    ]);
    sub = (subRes.data?.[0] as unknown as ActiveSub) ?? null;
    payments = payRes.data ?? [];
    attendanceCount = attRes.count ?? 0;
  }

  // eslint-disable-next-line react-hooks/purity -- server component, Date.now() is stable per request
  const now = Date.now();
  const daysLeft = sub
    ? Math.max(0, Math.ceil((new Date(sub.end_date).getTime() - now) / 86_400_000))
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl sm:text-4xl">
          Welcome back{session.profile.full_name ? `, ${session.profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-muted">Here&apos;s your fitness snapshot.</p>
      </div>

      {!member ? (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-surface/60 p-8">
          <AlertTriangle className="size-8 text-primary" />
          <h2 className="text-xl">No membership linked yet</h2>
          <p className="max-w-lg text-sm text-muted">
            Your login isn&apos;t linked to a gym membership yet. Visit the front desk
            or book a plan online and our team will connect it to your account.
          </p>
          <Link
            href="/portal/membership"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground"
          >
            Buy a plan <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={BadgeCheck}
              label="Membership"
              value={sub?.membership_plans?.name ?? "—"}
              note={member.member_code ?? undefined}
            />
            <Link href="/portal/membership" className="group">
              <StatCard
                icon={CalendarDays}
                label="Days remaining"
                value={sub ? String(daysLeft) : "—"}
                note={
                  sub
                    ? daysLeft <= 7
                      ? "Expiring soon — tap to renew"
                      : `Renews ${new Date(sub.end_date).toLocaleDateString("en-IN")}`
                    : "No active plan — tap to buy"
                }
                warn={sub ? daysLeft <= 7 : false}
              />
            </Link>
            <StatCard
              icon={Dumbbell}
              label="Total check-ins"
              value={String(attendanceCount)}
              note={`Since ${new Date(member.join_date).toLocaleDateString("en-IN")}`}
            />
            <StatCard
              icon={CreditCard}
              label="Status"
              value={member.status}
              note={sub?.status === "active" ? "Active subscription" : "No active subscription"}
            />
          </div>

          <section className="rounded-3xl border border-border bg-surface/60 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl">Recent payments</h2>
              <Link href="/portal/payments" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            {payments.length === 0 ? (
              <p className="text-sm text-muted">No payments recorded yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {payments.map((p, i) => (
                  <li key={i} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-muted">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN") : "—"}
                      {p.invoice_no && <span className="ml-2 text-muted-2">{p.invoice_no}</span>}
                    </span>
                    <span className="font-semibold">{formatINR(Number(p.amount))}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  warn,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  note?: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-2">
        <Icon className={`size-4 ${warn ? "text-ember" : "text-primary"}`} />
        {label}
      </div>
      <div className={`mt-2 font-display text-3xl capitalize ${warn ? "text-ember" : ""}`}>{value}</div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </div>
  );
}
