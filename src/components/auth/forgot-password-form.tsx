"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setServerError(null);
    const res = await resetPassword(values.email);
    if (!res.ok) {
      setServerError(res.error ?? "Something went wrong.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center">
        <h2 className="text-2xl">Check your email 📬</h2>
        <p className="mt-3 text-muted">
          We&apos;ve sent a password reset link.{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Back to login
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" suppressHydrationWarning>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input {...form.register("email")} className={inputCls} placeholder="you@email.com" autoComplete="email" />
      </Field>
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="mt-2 w-full">
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send Reset Link
      </Button>
      {serverError && (
        <p className="text-center text-sm text-ember" role="alert">
          {serverError}
        </p>
      )}
      <p className="text-center text-sm text-muted">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
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
    <label className={cn("flex flex-col gap-1.5")}>
      <span className="text-sm text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-ember">{error}</span>}
    </label>
  );
}
