import { z } from "zod";
import { getUserProfile } from "@/lib/supabase/server";
import { query } from "@/lib/db";
import { createRazorpayOrder, isRazorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  planSlug: z.string().trim().min(1).max(40),
  term: z.enum(["monthly", "quarterly", "yearly"]),
});

const PRICE_COLUMN = {
  monthly: "price_monthly",
  quarterly: "price_quarterly",
  yearly: "price_yearly",
} as const;

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return Response.json({ error: "Online payments are not enabled yet." }, { status: 503 });
  }

  // Must be a logged-in user.
  const session = await getUserProfile();
  if (!session) {
    return Response.json({ error: "Please log in to continue." }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { planSlug, term } = parsed;

  // Look up the plan and its price for the chosen term.
  const plans = await query<{ id: string; name: string; price: string }>(
    `select id, name, ${PRICE_COLUMN[term]}::text as price
       from public.membership_plans
      where slug = $1 and is_active = true
      limit 1`,
    [planSlug]
  );
  const plan = plans[0];
  if (!plan) {
    return Response.json({ error: "Plan not found." }, { status: 404 });
  }
  const amount = Number(plan.price);
  if (!(amount > 0)) {
    return Response.json({ error: "This plan can't be paid online." }, { status: 400 });
  }

  // Resolve the member row for this login; create one from the profile if the
  // user signed up but was never linked (self-serve first purchase).
  const existing = await query<{ id: string }>(
    `select id from public.members where profile_id = $1 order by created_at limit 1`,
    [session.user.id]
  );
  let memberId = existing[0]?.id;
  if (!memberId) {
    const created = await query<{ id: string }>(
      `insert into public.members (profile_id, full_name, email, phone, created_by)
       values ($1, $2, $3, $4, $1)
       returning id`,
      [
        session.user.id,
        session.profile.full_name ?? session.profile.email ?? "Member",
        session.profile.email,
        session.profile.phone,
      ]
    );
    memberId = created[0].id;
  }

  try {
    const order = await createRazorpayOrder({
      amount,
      receipt: `sub_${memberId.slice(0, 8)}_${Date.now()}`,
      notes: { member_id: memberId, plan_id: plan.id, plan_slug: planSlug, term },
    });
    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId(),
      planName: plan.name,
      memberId,
      planId: plan.id,
      term,
      customer: {
        name: session.profile.full_name ?? "",
        email: session.profile.email ?? "",
        phone: session.profile.phone ?? "",
      },
    });
  } catch (e) {
    console.error("razorpay/order:", e);
    return Response.json({ error: "Could not start payment. Try again." }, { status: 502 });
  }
}
