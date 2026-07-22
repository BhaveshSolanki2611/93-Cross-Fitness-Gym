import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import {
  NotificationComposer,
  BulkReminderButton,
} from "@/components/admin/notification-composer";

export default async function AdminNotifications() {
  await requireStaff();

  const [members, log] = await Promise.all([
    query<{ id: string; label: string; email: string | null; phone: string | null }>(
      `select id, full_name || coalesce(' · ' || member_code, '') as label, email, phone
       from members order by full_name asc limit 500`
    ),
    query<{
      id: string;
      channel: string;
      template: string | null;
      status: string;
      error: string | null;
      created_at: string;
      member_name: string | null;
      payload: { to?: string; subject?: string | null; message?: string };
    }>(
      `select n.id, n.channel::text, n.template, n.status, n.error, n.created_at,
              m.full_name as member_name, n.payload
       from notifications_log n
       left join members m on m.id = n.member_id
       order by n.created_at desc limit 60`
    ),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Notifications</h1>
        <p className="mt-1 text-muted">
          Send WhatsApp/email/SMS to members and run bulk fee reminders. Without
          provider API keys, sends run in simulate mode and are still logged.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-border bg-surface/60 p-6">
          <h2 className="mb-4 text-lg">Compose</h2>
          <NotificationComposer members={members} />
        </section>

        <section className="rounded-3xl border border-border bg-surface/60 p-6">
          <h2 className="mb-2 text-lg">Bulk fee reminders</h2>
          <p className="mb-4 text-sm text-muted">
            Notifies every active member whose subscription expires within 7 days
            (or lapsed in the last 3).
          </p>
          <BulkReminderButton />
        </section>
      </div>

      <section className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">When</th>
              <th className="p-4">Member / To</th>
              <th className="p-4">Channel</th>
              <th className="p-4">Template</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {log.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No notifications sent yet.
                </td>
              </tr>
            )}
            {log.map((n) => (
              <tr key={n.id} className="border-b border-border last:border-0">
                <td className="p-4 text-muted">
                  {new Date(n.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-4">
                  <div className="font-medium">{n.member_name ?? "—"}</div>
                  <div className="text-xs text-muted-2">{n.payload?.to ?? ""}</div>
                </td>
                <td className="p-4 uppercase text-muted">{n.channel}</td>
                <td className="p-4 text-muted">{n.template ?? "custom"}</td>
                <td className="p-4">
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (n.status === "sent"
                        ? "bg-primary/10 text-primary"
                        : n.status === "simulated"
                          ? "bg-sky-400/10 text-sky-400"
                          : "bg-ember/10 text-ember")
                    }
                    title={n.error ?? undefined}
                  >
                    {n.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
