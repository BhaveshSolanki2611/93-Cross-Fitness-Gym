import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { LeadActions } from "@/components/admin/status-actions";

export default async function AdminLeads({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaff();
  const { status = "" } = await searchParams;

  const params: unknown[] = [];
  let where = "";
  if (status && ["new", "contacted", "trial_booked", "converted", "lost"].includes(status)) {
    params.push(status);
    where = `where status = $1::lead_status`;
  }

  const leads = await query<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    interest: string | null;
    message: string | null;
    status: string;
    created_at: string;
  }>(
    `select id, name, phone, email, interest, message, status::text, created_at
     from leads ${where} order by created_at desc limit 100`,
    params
  );

  const tabs = ["", "new", "contacted", "trial_booked", "converted", "lost"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Leads</h1>
        <p className="mt-1 text-muted">Enquiries from the contact form — follow up fast.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <a
            key={t}
            href={t ? `/admin/leads?status=${t}` : "/admin/leads"}
            className={
              "rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors " +
              (status === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted hover:text-foreground")
            }
          >
            {t === "" ? "All" : t.replace(/_/g, " ")}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Received</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Interest</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No leads here yet.
                </td>
              </tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0 align-top">
                <td className="p-4 text-muted">
                  {new Date(l.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td className="p-4">
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-muted-2">
                    {l.phone}
                    {l.email ? ` · ${l.email}` : ""}
                  </div>
                  {l.message && <div className="mt-1 max-w-64 text-xs text-muted">{l.message}</div>}
                </td>
                <td className="p-4">{l.interest ?? "General"}</td>
                <td className="p-4">
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize " +
                      (l.status === "converted"
                        ? "bg-primary/10 text-primary"
                        : l.status === "new"
                          ? "bg-ember/10 text-ember"
                          : l.status === "lost"
                            ? "bg-surface-2 text-muted-2"
                            : "bg-sky-400/10 text-sky-400")
                    }
                  >
                    {l.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-4">
                  <LeadActions id={l.id} status={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
