import "server-only";
import { withTransaction } from "@/lib/db";
import { TERM_MONTHS } from "@/lib/razorpay";

/**
 * Record a captured Razorpay payment and extend the member's subscription.
 *
 * Idempotent: keyed on razorpay_payment_id (unique index from migration 0009).
 * If the same payment id is submitted twice (checkout-verify AND webhook, or a
 * webhook retry), the second call is a no-op and returns { alreadyProcessed }.
 *
 * Runs through the pg pool, which BYPASSES RLS — only ever called from trusted
 * server code after the payment signature has been verified.
 */
export type RecordResult =
  | { ok: true; alreadyProcessed: boolean }
  | { ok: false; error: string };

export async function recordRazorpaySubscriptionPayment(input: {
  memberId: string;
  planId: string | null;
  term: "monthly" | "quarterly" | "yearly";
  amount: number; // INR (major unit)
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string | null;
}): Promise<RecordResult> {
  const months = TERM_MONTHS[input.term];

  try {
    return await withTransaction(async (client) => {
      // 1. Insert the payment. The unique index makes this the idempotency gate.
      const pay = await client.query<{ id: string }>(
        `insert into public.payments
           (member_id, amount, currency, method, status,
            razorpay_order_id, razorpay_payment_id, razorpay_signature)
         values ($1, $2, 'INR', 'razorpay', 'paid', $3, $4, $5)
         on conflict (razorpay_payment_id) where razorpay_payment_id is not null do nothing
         returning id`,
        [
          input.memberId,
          input.amount,
          input.razorpayOrderId,
          input.razorpayPaymentId,
          input.razorpaySignature ?? null,
        ]
      );

      // Already recorded by a prior call → stop, don't extend again.
      if (pay.rowCount === 0) {
        return { ok: true, alreadyProcessed: true } as const;
      }
      const paymentId = pay.rows[0].id;

      // 2. Extend from the later of today or the current active end_date so a
      //    renewal made before expiry adds time instead of losing it.
      const sub = await client.query<{ id: string }>(
        `insert into public.member_subscriptions
           (member_id, plan_id, term, start_date, end_date, amount, status)
         select
           $1, $2, $3::sub_term,
           current_date,
           greatest(
             current_date,
             coalesce(
               (select max(end_date) from public.member_subscriptions
                 where member_id = $1 and status = 'active'),
               current_date
             )
           ) + ($4 || ' months')::interval,
           $5, 'active'
         returning id`,
        [input.memberId, input.planId, input.term, String(months), input.amount]
      );

      // 3. Link the payment to the subscription it paid for.
      await client.query(
        `update public.payments set subscription_id = $1 where id = $2`,
        [sub.rows[0].id, paymentId]
      );

      // 4. Make sure the member is active.
      await client.query(
        `update public.members set status = 'active' where id = $1 and status <> 'active'`,
        [input.memberId]
      );

      return { ok: true, alreadyProcessed: false } as const;
    });
  } catch (e) {
    console.error("recordRazorpaySubscriptionPayment:", e);
    return { ok: false, error: "Could not record payment." };
  }
}
