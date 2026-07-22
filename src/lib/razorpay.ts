import "server-only";
import crypto from "node:crypto";

/**
 * Razorpay server helpers (REST + crypto — no SDK dependency).
 *
 * Mirrors the notify.ts pattern: without keys, the app keeps working and
 * `isRazorpayConfigured()` is false so the UI can hide/disable online pay.
 *
 * Env:
 *   RAZORPAY_KEY_ID            (also exposed to client as the checkout key)
 *   RAZORPAY_KEY_SECRET        (server only — Basic auth + payment signature)
 *   RAZORPAY_WEBHOOK_SECRET    (server only — webhook signature)
 */

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

/** Public key id for the client-side checkout. */
export function razorpayKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID ?? null;
}

export interface RazorpayOrder {
  id: string;
  amount: number; // paise
  currency: string;
  receipt?: string;
  status: string;
}

/** Create an order. `amount` is in the major unit (INR); converted to paise here. */
export async function createRazorpayOrder(params: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(params.amount * 100),
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes ?? {},
    }),
  });

  const body = (await res.json()) as RazorpayOrder & { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(body.error?.description ?? `Razorpay order failed (HTTP ${res.status})`);
  }
  return body;
}

export interface RazorpayOrderDetail extends RazorpayOrder {
  notes: Record<string, string>;
}

/** Fetch an order (authoritative amount + the notes we set at creation). */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrderDetail> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const body = (await res.json()) as RazorpayOrderDetail & { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(body.error?.description ?? `Razorpay order fetch failed (HTTP ${res.status})`);
  }
  return body;
}

/**
 * Verify the checkout callback signature.
 * HMAC_SHA256(order_id + "|" + payment_id, key_secret) === signature.
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, params.signature);
}

/**
 * Verify a webhook payload signature.
 * HMAC_SHA256(rawBody, webhook_secret) === X-Razorpay-Signature.
 */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

/** Constant-time compare that never throws on length mismatch. */
function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export const TERM_MONTHS: Record<"monthly" | "quarterly" | "yearly", number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};
