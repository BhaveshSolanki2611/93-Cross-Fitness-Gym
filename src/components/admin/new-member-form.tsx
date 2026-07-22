"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createMember } from "@/app/actions/admin";
import { pricingPlans } from "@/config/pricing";

const schema = z.object({
  fullName: z.string().min(2, "Enter the member's name").max(120),
  phone: z.string().min(10, "Enter a valid phone").max(15),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  planSlug: z.string().optional().or(z.literal("")),
  term: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  // Kept as string for react-hook-form; converted to number on submit.
  amount: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), "Invalid amount"),
});

type Values = z.infer<typeof schema>;

export function NewMemberForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { term: "monthly" },
  });

  const planSlug = useWatch({ control, name: "planSlug" });
  const term = useWatch({ control, name: "term" });
  const selectedPlan = pricingPlans.find((p) => p.id === planSlug);
  const suggested =
    selectedPlan && term ? selectedPlan[term as "monthly" | "quarterly" | "yearly"] : undefined;

  async function onSubmit(values: Values) {
    setServerError(null);
    const amountNum = values.amount ? Number(values.amount) : undefined;
    const res = await createMember({
      ...values,
      amount: values.planSlug ? (amountNum ?? suggested ?? 0) : undefined,
    });
    if (res.ok) {
      router.push("/admin/members");
      router.refresh();
    } else {
      setServerError(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputCls} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls} inputMode="tel" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (optional)" error={errors.email?.message}>
          <input {...register("email")} className={inputCls} />
        </Field>
        <p className="-mt-2 text-xs text-muted-2">
          If this email matches a registered account, the member portal will be auto-linked.
        </p>
        <Field label="Gender (optional)">
          <select {...register("gender")} className={inputCls}>
            <option value="">—</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <div className="mt-2 rounded-2xl border border-border bg-surface-2/40 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
          Subscription (optional)
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Plan">
            <select {...register("planSlug")} className={inputCls}>
              <option value="">No plan yet</option>
              {pricingPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Term">
            <select {...register("term")} className={inputCls} disabled={!planSlug}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
          <Field label={`Amount ₹${suggested ? ` (suggested ${suggested})` : ""}`}>
            <input
              type="number"
              {...register("amount")}
              className={inputCls}
              placeholder={suggested?.toString() ?? "0"}
              disabled={!planSlug}
            />
          </Field>
        </div>
        <p className="mt-3 text-xs text-muted-2">
          Selecting a plan creates an active subscription and records the initial payment (cash).
        </p>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-fit">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Creating…" : "Create member"}
      </Button>
      {serverError && <p className="text-sm text-ember">{serverError}</p>}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-ember">{error}</span>}
    </label>
  );
}
