import { z } from "zod";
import { getUserProfile } from "@/lib/supabase/server";
import {
  fetchRazorpayOrder,
  isRazorpayConfigured,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import { recordRazorpaySubscriptionPayment } from "@/lib/subscriptions";
import { notifyRenewalThanks } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Checkout success callback. Verifies the payment signature, then reads the
 * TRUSTED order details (amount + notes) from Razorpay — never from the client —
 * and records the payment. The webhook is the authoritative backstop; this
 * route gives the member instant confirmation. Both are idempotent.
 */
const bodySchema = z.object({
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return Response.json({ error: "Online payments are not enabled." }, { status: 503 });
  }
  const session = await getUserProfile();
  if (!session) return Response.json({ error: "Please log in." }, { status: 401 });

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const ok = verifyPaymentSignature({
    orderId: parsed.razorpay_order_id,
    paymentId: parsed.razorpay_payment_id,
    signature: parsed.razorpay_signature,
  });
  if (!ok) {
    return Response.json({ error: "Payment verification failed." }, { status: 400 });
  }

  // Read trusted values from the order (we set member_id/plan_id/term as notes).
  let order;
  try {
    order = await fetchRazorpayOrder(parsed.razorpay_order_id);
  } catch (e) {
    console.error("verify/fetch order:", e);
    return Response.json({ error: "Could not confirm payment. Contact support." }, { status: 502 });
  }

  const memberId = order.notes?.member_id;
  const term = order.notes?.term as "monthly" | "quarterly" | "yearly" | undefined;
  if (!memberId || !term) {
    return Response.json({ error: "Order metadata missing." }, { status: 422 });
  }

  const result = await recordRazorpaySubscriptionPayment({
    memberId,
    planId: order.notes?.plan_id ?? null,
    term,
    amount: order.amount / 100,
    razorpayOrderId: parsed.razorpay_order_id,
    razorpayPaymentId: parsed.razorpay_payment_id,
    razorpaySignature: parsed.razorpay_signature,
  });
  if (!result.ok) return Response.json({ error: result.error }, { status: 500 });

  // Thank-you message only on first processing (webhook may have beaten us).
  if (!result.alreadyProcessed) {
    await notifyRenewalThanks(memberId);
  }

  return Response.json({ ok: true });
}
