import { redirect } from "next/navigation";
import { getSupabaseServer, getUserProfile } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";

export default async function PortalPayments() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal/payments");
  const supabase = (await getSupabaseServer())!;

  const { data: members } = await supabase.from("members").select("id");
  const memberIds = (members ?? []).map((m) => m.id);

  const { data: payments } = memberIds.length
    ? await supabase
        .from("payments")
        .select("amount, method, status, invoice_no, paid_at, created_at, notes")
        .in("member_id", memberIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Payment history</h1>
        <p className="mt-1 text-muted">Your invoices and receipts.</p>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Date</th>
              <th className="p-4">Invoice</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No payments recorded yet.
                </td>
              </tr>
            )}
            {(payments ?? []).map((p, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="p-4 text-muted">
                  {new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4">{p.invoice_no ?? "—"}</td>
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
                <td className="p-4 text-right font-semibold">{formatINR(Number(p.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
