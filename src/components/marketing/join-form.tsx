"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { submitBooking } from "@/app/actions/forms";

const bookingTypes = [
  "Gym membership",
  "Free trial",
  "Personal trainer",
  "Fitness assessment",
  "Nutrition consultation",
  "Group class",
  "Spa appointment",
] as const;

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  type: z.string(),
  plan: z.string().optional(),
  preferredDate: z.string().optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function JoinForm() {
  const params = useSearchParams();
  const isTrial = params.get("trial") === "1";
  const planParam = params.get("plan") ?? "";
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: isTrial ? "Free trial" : "Gym membership",
      plan: planParam,
    },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const res = await submitBooking(values);
    if (res.ok) {
      setSubmitted(true);
    } else {
      setServerError(res.error ?? "Something went wrong.");
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center">
        <CheckCircle2 className="size-12 text-primary" />
        <h3 className="text-2xl">Booking received!</h3>
        <p className="max-w-sm text-muted">
          We&apos;ll confirm your slot shortly by phone or WhatsApp. See you at the gym! 💪
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input {...register("name")} className={inputCls} placeholder="Your name" />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls} placeholder="Phone number" inputMode="tel" />
        </Field>
      </div>
      <Field label="Email (optional)" error={errors.email?.message}>
        <input {...register("email")} className={inputCls} placeholder="you@email.com" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="I want to book" error={errors.type?.message}>
          <select {...register("type")} className={inputCls}>
            {bookingTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Plan (optional)">
          <select {...register("plan")} className={inputCls}>
            <option value="">No specific plan</option>
            {pricingPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Preferred date (optional)">
        <input {...register("preferredDate")} type="date" className={inputCls} />
      </Field>
      <Field label="Notes (optional)">
        <textarea {...register("notes")} rows={3} className={cn(inputCls, "h-auto py-3")} placeholder="Anything we should know?" />
      </Field>
      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Booking…" : "Confirm booking"}
      </Button>
      {serverError && (
        <p className="text-center text-sm text-ember" role="alert">
          {serverError}
        </p>
      )}
      <p className="text-center text-xs text-muted-2">
        By submitting you agree to be contacted about your booking. No spam, ever.
      </p>
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-primary";

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
