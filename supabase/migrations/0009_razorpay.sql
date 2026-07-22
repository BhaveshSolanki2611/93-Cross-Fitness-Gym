-- 0009 — Razorpay idempotency
-- Guarantee a Razorpay payment is recorded at most once, so the checkout-verify
-- route and the webhook can both run `on conflict do nothing` safely.

create unique index if not exists uniq_payments_rzp_payment
  on public.payments(razorpay_payment_id)
  where razorpay_payment_id is not null;
