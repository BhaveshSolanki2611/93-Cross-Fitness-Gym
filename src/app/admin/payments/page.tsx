import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { RecordPaymentForm } from "@/components/admin/record-payment-form";

export default async function AdminPayments() {
  await requireStaff();

  const [members, payments, totals] = await Promise.all([
    query<{ id: string; label: string }>(
      `select id, full_name || coalesce(' · ' || member_code, '') as label
       from members order by full_name asc limit 500`
    ),
    query<{
      id: string;
      amount: string;
      method: string;
      status: string;
      invoice_no: string | null;
      paid_at: string | null;
      created_at: string;
      member_name: string | null;
    }>(
      `select p.id, p.amount::text, p.method::text, p.status::text, p.invoice_no,
              p.paid_at, p.created_at, m.full_name as member_name
       from payments p
       left join members m on m.id = p.member_id
       order by p.created_at desc limit 100`
    ),
    query<{ today: string | null; month: string | null }>(
      `select
        (select sum(amount) from payments where status='paid' and coalesce(paid_at, created_at)::date = current_date)::text as today,
        (select sum(amount) from payments where status='paid' and date_trunc('month', coalesce(paid_at, created_at)) = date_trunc('month', now()))::text as month`
    ),
  ]);

  const t = totals[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Payments</h1>
          <p className="mt-1 text-muted">Record fees and track collections.</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-2">Today</div>
            <div className="font-display text-2xl text-primary">
              {formatINR(Number(t?.today ?? 0))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-2">This month</div>
            <div className="font-display text-2xl">{formatINR(Number(t?.month ?? 0))}</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="mb-4 text-lg">Record a payment</h2>
        <RecordPaymentForm members={members} />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Date</th>
              <th className="p-4">Member</th>
              <th className="p-4">Invoice</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-4 text-muted">
                  {new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4">{p.member_name ?? "—"}</td>
                <td className="p-4 text-muted">{p.invoice_no ?? "—"}</td>
                <td className="p-4 uppercase text-muted">{p.method}</td>
                <td className="p-4">
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (p.status === "paid"
                        ? "bg-primary/10 text-primary"
                        : p.status === "refunded"
                          ? "bg-sky-400/10 text-sky-400"
                          : "bg-ember/10 text-ember")
                    }
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-right font-semibold">
                  {formatINR(Number(p.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
