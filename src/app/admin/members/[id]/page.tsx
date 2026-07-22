import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { EditMemberForm } from "@/components/admin/edit-member-form";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;

  const members = await query<{
    id: string;
    member_code: string | null;
    full_name: string;
    phone: string | null;
    email: string | null;
    gender: string | null;
    status: "active" | "frozen" | "expired" | "cancelled" | "lead";
    join_date: string;
  }>(
    `select id, member_code, full_name, phone, email, gender, status::text as status, join_date
     from members
     where id = $1`,
    [id]
  );

  if (members.length === 0) {
    notFound();
  }
  const member = members[0];

  const payments = await query<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    method: string;
  }>(
    `select id, amount, status, created_at, method
     from payments
     where member_id = $1
     order by created_at desc
     limit 5`,
    [id]
  );

  const subscriptions = await query<{
    id: string;
    end_date: string;
    status: string;
    plan_name: string;
  }>(
    `select s.id, s.end_date, s.status, p.name as plan_name
     from member_subscriptions s
     join membership_plans p on p.id = s.plan_id
     where s.member_id = $1
     order by s.end_date desc
     limit 1`,
    [id]
  );
  const activeSub = subscriptions[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/members"
          className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted hover:border-primary hover:text-primary"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-3xl">Edit Member</h1>
          <p className="mt-1 text-muted">
            {member.member_code ? `Code: ${member.member_code}` : "Manage member profile and status"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-surface/60 p-6 md:p-8">
            <EditMemberForm member={member} />
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-surface/60 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
              Subscription Status
            </h3>
            {activeSub ? (
              <div>
                <p className="font-medium">{activeSub.plan_name}</p>
                <p className="mt-1 text-sm text-muted">
                  Valid till: {new Date(activeSub.end_date).toLocaleDateString("en-IN")}
                </p>
                <span
                  className={
                    "mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize " +
                    (activeSub.status === "active"
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-2 text-muted")
                  }
                >
                  {activeSub.status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted">No active subscription</p>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface/60 p-6">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
              Recent Payments
            </h3>
            {payments.length > 0 ? (
              <div className="flex flex-col gap-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">₹{p.amount}</p>
                      <p className="text-xs text-muted-2 capitalize">{p.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(p.created_at).toLocaleDateString("en-IN")}</p>
                      <p className={"text-xs capitalize " + (p.status === 'paid' ? 'text-primary' : 'text-ember')}>{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No payments found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
