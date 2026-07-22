"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordPayment } from "@/app/actions/admin";
import { pricingPlans } from "@/config/pricing";

const schema = z.object({
  memberId: z.string().uuid("Select a member"),
  amount: z
    .string()
    .min(1, "Enter an amount")
    .refine((v) => Number(v) > 0, "Enter a valid amount"),
  method: z.enum(["cash", "card", "upi", "razorpay", "bank", "other"]),
  notes: z.string().max(500).optional().or(z.literal("")),
  planSlug: z.string().optional().or(z.literal("")),
  term: z.string().optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function RecordPaymentForm({
  members,
}: {
  members: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { method: "cash", planSlug: "", term: "" },
  });

  const planSlug = useWatch({ control, name: "planSlug" });
  const term = useWatch({ control, name: "term" });

  React.useEffect(() => {
    if (planSlug && term && term !== "") {
      const plan = pricingPlans.find((p) => p.id === planSlug);
      if (plan) {
        if (term === "monthly") setValue("amount", plan.monthly.toString());
        if (term === "quarterly") setValue("amount", plan.quarterly.toString());
        if (term === "yearly") setValue("amount", plan.yearly.toString());
      }
    }
  }, [planSlug, term, setValue]);

  async function onSubmit(values: Values) {
    setServerError(null);
    const payload = {
      ...values,
      amount: Number(values.amount),
      planSlug: values.planSlug || undefined,
      term: (values.term && values.term !== "") ? values.term as "monthly" | "quarterly" | "yearly" : undefined,
    };
    const res = await recordPayment(payload);
    if (res.ok) {
      reset();
      router.refresh();
    } else {
      setServerError(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <label className="flex flex-col gap-1.5 lg:col-span-2">
        <span className="text-sm text-muted">Member</span>
        <select {...register("memberId")} className={inputCls}>
          <option value="">Select member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        {errors.memberId && (
          <span className="text-xs text-ember">{errors.memberId.message}</span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Amount (₹)</span>
        <input type="number" {...register("amount")} className={inputCls} />
        {errors.amount && (
          <span className="text-xs text-ember">{errors.amount.message}</span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Method</span>
        <select {...register("method")} className={inputCls}>
          {["cash", "card", "upi", "razorpay", "bank", "other"].map((m) => (
            <option key={m} value={m}>
              {m.toUpperCase()}
            </option>
          ))}
        </select>
      </label>

      {/* Renew Subscription Section */}
      <div className="col-span-full mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-border p-4">
        <div className="col-span-full">
          <h4 className="text-sm font-medium text-foreground">Renew Subscription (Optional)</h4>
          <p className="text-xs text-muted">Select a plan to extend the member&apos;s subscription.</p>
        </div>
        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-sm text-muted">Plan</span>
          <select {...register("planSlug")} className={inputCls}>
            <option value="">None</option>
            {pricingPlans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-sm text-muted">Term</span>
          <select {...register("term")} className={inputCls}>
            <option value="">Select term…</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
      </div>

      <div className="flex items-end lg:col-span-5 mt-2">
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full sm:w-auto ml-auto px-8">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Record"}
        </Button>
      </div>
      {serverError && (
        <p className="text-sm text-ember sm:col-span-2 lg:col-span-5">{serverError}</p>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors focus:border-primary";
