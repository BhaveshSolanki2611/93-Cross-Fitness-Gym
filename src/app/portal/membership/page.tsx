import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Landmark } from "lucide-react";
import { getSupabaseServer, getUserProfile } from "@/lib/supabase/server";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { formatINR } from "@/lib/utils";
import { RenewMembership } from "@/components/portal/renew-membership";

export default async function PortalMembership() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal/membership");
  const supabase = (await getSupabaseServer())!;

  // Current membership picture (RLS scopes to own rows).
  const { data: members } = await supabase
    .from("members")
    .select("id, member_code, full_name")
    .order("created_at", { ascending: true });
  const member = members?.[0] ?? null;

  type Sub = {
    end_date: string;
    status: string;
    amount: number;
    term: string;
    membership_plans: { name: string } | null;
  };
  let sub: Sub | null = null;
  if (member) {
    const { data } = await supabase
      .from("member_subscriptions")
      .select("end_date, status, amount, term, membership_plans(name)")
      .eq("member_id", member.id)
      .eq("status", "active")
      .order("end_date", { ascending: false })
      .limit(1);
    sub = (data?.[0] as unknown as Sub) ?? null;
  }

  const online = isRazorpayConfigured();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Membership</h1>
        <p className="mt-1 text-muted">Renew, upgrade or start a plan.</p>
      </div>

      {sub && (
        <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-border bg-surface/60 p-6">
          <div className="flex items-center gap-3">
            <Landmark className="size-6 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-2">Current plan</p>
              <p className="font-semibold">
                {sub.membership_plans?.name ?? "—"}{" "}
                <span className="text-muted">({sub.term})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="size-6 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-2">Valid till</p>
              <p className="font-semibold">
                {new Date(sub.end_date).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-2">Last amount</p>
            <p className="font-semibold">{formatINR(Number(sub.amount))}</p>
          </div>
        </div>
      )}

      {online ? (
        <RenewMembership />
      ) : (
        <div className="rounded-3xl border border-border bg-surface/60 p-8">
          <h2 className="text-xl">Online payments coming soon</h2>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Renew at the front desk, or reach us on WhatsApp / phone and we&apos;ll help you
            renew right away. Compare plans on the{" "}
            <Link href="/pricing" className="text-primary hover:underline">
              pricing page
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
