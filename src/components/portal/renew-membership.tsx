"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { pricingPlans } from "@/config/pricing";

/**
 * Plan + term picker that opens Razorpay Checkout and confirms the payment
 * against /api/razorpay/verify. Rendered only when online pay is enabled
 * (parent checks isRazorpayConfigured()).
 */

type Term = "monthly" | "quarterly" | "yearly";

const TERM_LABEL: Record<Term, string> = {
  monthly: "1 month",
  quarterly: "3 months",
  yearly: "12 months",
};

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

let sdkPromise: Promise<boolean> | null = null;
function loadRazorpaySdk(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => {
        sdkPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return sdkPromise;
}

export function RenewMembership({ defaultPlan = "pro" }: { defaultPlan?: string }) {
  const router = useRouter();
  const [planSlug, setPlanSlug] = useState(defaultPlan);
  const [term, setTerm] = useState<Term>("monthly");
  const [phase, setPhase] = useState<"idle" | "starting" | "paying" | "verifying" | "done">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const plan = pricingPlans.find((p) => p.id === planSlug) ?? pricingPlans[0];
  const price = plan[term];
  const busy = phase !== "idle" && phase !== "done";

  async function pay() {
    setError(null);
    setPhase("starting");

    const sdkOk = await loadRazorpaySdk();
    if (!sdkOk || !window.Razorpay) {
      setError("Couldn't load the payment window. Check your connection and retry.");
      setPhase("idle");
      return;
    }

    let order: {
      orderId: string;
      amount: number;
      currency: string;
      keyId: string;
      planName: string;
      customer: { name: string; email: string; phone: string };
      error?: string;
    };
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: plan.id, term }),
      });
      order = await res.json();
      if (!res.ok) throw new Error(order.error ?? "Could not start payment.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start payment.");
      setPhase("idle");
      return;
    }

    setPhase("paying");
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "93 Cross Fitness Gym & Spa",
      description: `${order.planName} — ${TERM_LABEL[term]}`,
      order_id: order.orderId,
      prefill: {
        name: order.customer.name,
        email: order.customer.email,
        contact: order.customer.phone,
      },
      theme: { color: "#c8f43a" },
      handler: async (response) => {
        setPhase("verifying");
        try {
          const res = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const body = (await res.json()) as { ok?: boolean; error?: string };
          if (!res.ok || !body.ok) throw new Error(body.error ?? "Verification failed.");
          setPhase("done");
          router.refresh();
        } catch (e) {
          // Payment went through but our confirm call failed — the webhook
          // will still record it; tell the member not to pay again.
          setError(
            (e instanceof Error ? e.message : "Verification failed.") +
              " If money was deducted, your membership will update automatically — do not pay again."
          );
          setPhase("idle");
        }
      },
      modal: {
        ondismiss: () => setPhase("idle"),
      },
    });
    rzp.open();
  }

  if (phase === "done") {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-primary/40 bg-primary/10 p-6 text-primary">
        <BadgeCheck className="size-6 shrink-0" />
        <div>
          <p className="font-semibold">Payment successful!</p>
          <p className="text-sm text-foreground/80">
            Your {plan.name} membership is active. A receipt has been recorded in your payment
            history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-surface/60 p-6">
      <h2 className="text-xl">Renew / upgrade membership</h2>
      <p className="mt-1 text-sm text-muted">Pay securely online with UPI, card or netbanking.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-2">Plan</span>
          <select
            value={planSlug}
            onChange={(e) => setPlanSlug(e.target.value)}
            disabled={busy}
            className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-foreground focus:border-primary focus:outline-none"
          >
            {pricingPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.tagline}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-2">
            Duration
          </span>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value as Term)}
            disabled={busy}
            className="h-11 rounded-xl border border-border bg-surface-2 px-3 text-foreground focus:border-primary focus:outline-none"
          >
            {(Object.keys(TERM_LABEL) as Term[]).map((t) => (
              <option key={t} value={t}>
                {TERM_LABEL[t]} — {formatINR(plan[t])}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-2">Total</p>
          <p className="text-2xl font-bold">{formatINR(price)}</p>
        </div>
        <Button onClick={pay} disabled={busy} size="lg">
          {busy && <Loader2 className="animate-spin" />}
          {phase === "verifying" ? "Confirming…" : busy ? "Processing…" : "Pay now"}
        </Button>
      </div>
    </div>
  );
}
