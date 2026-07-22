import { fetchRazorpayOrder, verifyWebhookSignature } from "@/lib/razorpay";
import { recordRazorpaySubscriptionPayment } from "@/lib/subscriptions";
import { notifyRenewalThanks } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — authoritative payment recorder for production (fires even
 * if the member closes the tab before the verify callback runs). Configure in
 * the Razorpay dashboard: URL = https://<domain>/api/razorpay/webhook, event
 * `payment.captured`, secret = RAZORPAY_WEBHOOK_SECRET.
 *
 * Idempotent with the verify route via the unique razorpay_payment_id index.
 * Returns 400 on a bad signature, 500 on transient processing failure (so
 * Razorpay retries with backoff — retries are safe because of idempotency),
 * and 200 once handled or for events we don't act on.
 */
interface PaymentEntity {
  id: string;
  order_id: string;
  amount: number; // paise
  notes?: Record<string, string>;
}

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: PaymentEntity } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("Bad payload", { status: 400 });
  }

  // We only act on captured payments; ack everything else.
  if (event.event !== "payment.captured") {
    return new Response("ignored", { status: 200 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id || !entity.id) {
    return new Response("ok", { status: 200 });
  }

  try {
    // Notes live on the order; the payment entity may not carry them.
    const order = await fetchRazorpayOrder(entity.order_id);
    const memberId = order.notes?.member_id;
    const term = order.notes?.term as "monthly" | "quarterly" | "yearly" | undefined;

    if (memberId && term) {
      const result = await recordRazorpaySubscriptionPayment({
        memberId,
        planId: order.notes?.plan_id ?? null,
        term,
        amount: entity.amount / 100,
        razorpayOrderId: entity.order_id,
        razorpayPaymentId: entity.id,
      });
      if (!result.ok) {
        // Transient DB failure — ask Razorpay to retry (idempotency makes this safe).
        return new Response("retry", { status: 500 });
      }
      if (!result.alreadyProcessed) {
        await notifyRenewalThanks(memberId);
      }
    } else {
      console.warn("razorpay webhook: order missing member_id/term notes", entity.order_id);
    }
  } catch (e) {
    // Couldn't reach Razorpay/DB — let Razorpay retry with backoff.
    console.error("razorpay webhook processing:", e);
    return new Response("retry", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
