import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { BookingActions } from "@/components/admin/status-actions";

export default async function AdminBookings({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaff();
  const { status = "" } = await searchParams;

  const params: unknown[] = [];
  let where = "";
  if (status && ["pending", "confirmed", "cancelled", "completed"].includes(status)) {
    params.push(status);
    where = `where b.status = $1::booking_status`;
  }

  const bookings = await query<{
    id: string;
    name: string;
    phone: string;
    email: string | null;
    type: string;
    status: string;
    preferred_date: string | null;
    plan_name: string | null;
    notes: string | null;
    created_at: string;
  }>(
    `select b.id, b.name, b.phone, b.email, b.type::text, b.status::text,
            b.preferred_date, p.name as plan_name, b.notes, b.created_at
     from bookings b
     left join membership_plans p on p.id = b.plan_id
     ${where}
     order by b.created_at desc limit 100`,
    params
  );

  const tabs = ["", "pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Bookings</h1>
        <p className="mt-1 text-muted">Trials, classes, PT and spa requests from the website.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <a
            key={t}
            href={t ? `/admin/bookings?status=${t}` : "/admin/bookings"}
            className={
              "rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors " +
              (status === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted hover:text-foreground")
            }
          >
            {t === "" ? "All" : t}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Requested</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Type</th>
              <th className="p-4">Preferred date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  No bookings here yet.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 align-top">
                <td className="p-4 text-muted">
                  {new Date(b.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </td>
                <td className="p-4">
                  <div className="font-medium">{b.name}</div>
                  <div className="text-xs text-muted-2">
                    {b.phone}
                    {b.email ? ` · ${b.email}` : ""}
                  </div>
                  {b.notes && <div className="mt-1 max-w-56 text-xs text-muted">{b.notes}</div>}
                </td>
                <td className="p-4 capitalize">
                  {b.type.replace(/_/g, " ")}
                  {b.plan_name && <div className="text-xs text-primary">{b.plan_name}</div>}
                </td>
                <td className="p-4 text-muted">
                  {b.preferred_date
                    ? new Date(b.preferred_date).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="p-4">
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize " +
                      (b.status === "confirmed" || b.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : b.status === "pending"
                          ? "bg-ember/10 text-ember"
                          : "bg-surface-2 text-muted")
                    }
                  >
                    {b.status}
                  </span>
                </td>
                <td className="p-4">
                  <BookingActions id={b.id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
