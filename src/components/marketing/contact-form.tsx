"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitLead } from "@/app/actions/forms";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  interest: z.string(),
  message: z.string().max(1000).optional().or(z.literal("")),
});

export type ContactValues = z.infer<typeof schema>;

const interests = [
  "General enquiry",
  "Membership",
  "Free trial",
  "Personal training",
  "Group classes",
  "Spa services",
  "Corporate membership",
];

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { interest: interests[0] },
  });

  async function onSubmit(values: ContactValues) {
    setServerError(null);
    const res = await submitLead(values);
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
        <h3 className="text-2xl">Thanks — we&apos;ll be in touch!</h3>
        <p className="max-w-sm text-muted">
          Our team will reach out shortly. For anything urgent, message us on WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" error={errors.name?.message}>
          <input {...register("name")} className={inputCls} placeholder="Your name" />
        </FormField>
        <FormField label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls} placeholder="Phone number" inputMode="tel" />
        </FormField>
      </div>
      <FormField label="Email (optional)" error={errors.email?.message}>
        <input {...register("email")} className={inputCls} placeholder="you@email.com" />
      </FormField>
      <FormField label="I'm interested in" error={errors.interest?.message}>
        <select {...register("interest")} className={inputCls}>
          {interests.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Message (optional)" error={errors.message?.message}>
        <textarea {...register("message")} rows={4} className={cn(inputCls, "h-auto py-3")} placeholder="Tell us your goals…" />
      </FormField>
      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
      {serverError && (
        <p className="text-center text-sm text-ember" role="alert">
          {serverError}
        </p>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-primary";

function FormField({
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
