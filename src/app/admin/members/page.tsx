import Link from "next/link";
import { Plus, Search, Pencil } from "lucide-react";
import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { CheckInButton } from "@/components/admin/member-actions";

export default async function AdminMembers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireStaff();
  const { q = "", status = "" } = await searchParams;

  const filters: string[] = [];
  const params: unknown[] = [];
  if (q) {
    params.push(`%${q}%`);
    filters.push(
      `(m.full_name ilike $${params.length} or m.phone ilike $${params.length} or m.member_code ilike $${params.length})`
    );
  }
  if (status && ["active", "frozen", "expired", "cancelled", "lead"].includes(status)) {
    params.push(status);
    filters.push(`m.status = $${params.length}::member_status`);
  }
  const where = filters.length ? `where ${filters.join(" and ")}` : "";

  const members = await query<{
    id: string;
    member_code: string | null;
    full_name: string;
    phone: string | null;
    status: string;
    join_date: string;
    plan_name: string | null;
    end_date: string | null;
    checkins: string;
  }>(
    `select m.id, m.member_code, m.full_name, m.phone, m.status::text, m.join_date,
            p.name as plan_name, s.end_date,
            (select count(*) from attendance a where a.member_id = m.id)::text as checkins
     from members m
     left join lateral (
       select plan_id, end_date from member_subscriptions ms
       where ms.member_id = m.id and ms.status = 'active'
       order by ms.end_date desc limit 1
     ) s on true
     left join membership_plans p on p.id = s.plan_id
     ${where}
     order by m.created_at desc
     limit 100`,
    params
  );

  const statuses = ["", "active", "frozen", "expired", "cancelled"];
  // eslint-disable-next-line react-hooks/purity -- server component, Date.now() stable per request
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Members</h1>
          <p className="mt-1 text-muted">{members.length} shown</p>
        </div>
        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary-strong"
        >
          <Plus className="size-4" /> Add member
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" action="/admin/members" method="get">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, code…"
            className="h-11 w-72 rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-xl border border-border-strong px-5 text-sm font-semibold uppercase tracking-wide hover:border-primary hover:text-primary">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Member</th>
              <th className="p-4">Code</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Valid till</th>
              <th className="p-4">Status</th>
              <th className="p-4">Visits</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  No members found. Add your first member to get started.
                </td>
              </tr>
            )}
            {members.map((m) => {
              const expiring =
                m.end_date &&
                new Date(m.end_date).getTime() - now < 7 * 86_400_000;
              return (
                <tr key={m.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="font-medium">{m.full_name}</div>
                    <div className="text-xs text-muted-2">{m.phone ?? "—"}</div>
                  </td>
                  <td className="p-4 text-muted">{m.member_code ?? "—"}</td>
                  <td className="p-4">{m.plan_name ?? <span className="text-muted-2">None</span>}</td>
                  <td className={`p-4 ${expiring ? "text-ember" : "text-muted"}`}>
                    {m.end_date ? new Date(m.end_date).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        "rounded-full px-2.5 py-1 text-xs font-semibold capitalize " +
                        (m.status === "active"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-2 text-muted")
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted">{m.checkins}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted hover:border-primary hover:text-primary"
                        title="Edit member"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <CheckInButton memberId={m.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
