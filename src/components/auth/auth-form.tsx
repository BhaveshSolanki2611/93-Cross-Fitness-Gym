"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Please enter your name").max(120),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
});

type SignupValues = z.infer<typeof signupSchema>;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") ?? "/portal";
  const setupIssue = params.get("reason") === "setup";
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [signupDone, setSignupDone] = React.useState(false);

  const isSignup = mode === "signup";
  // For login mode we validate a subset; make optional fields tolerated so a
  // single form type covers both modes.
  const activeSchema = isSignup
    ? signupSchema
    : (loginSchema.extend({
        fullName: z.string().optional().or(z.literal("")),
        phone: z.string().optional().or(z.literal("")),
      }) as unknown as typeof signupSchema);
  const form = useForm<SignupValues>({
    resolver: zodResolver(activeSchema),
    defaultValues: { email: "", password: "", fullName: "", phone: "" },
  });

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    const res = isSignup ? await signUp(values) : await signIn(values);
    if (!res.ok) {
      setServerError(res.error ?? "Something went wrong.");
      return;
    }
    if (isSignup) {
      setSignupDone(true);
    } else {
      router.push(nextPath);
      router.refresh();
    }
  }

  if (signupDone) {
    return (
      <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 text-center">
        <h2 className="text-2xl">Check your email 📬</h2>
        <p className="mt-3 text-muted">
          We&apos;ve sent a confirmation link. Confirm your email, then{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" suppressHydrationWarning>
      {setupIssue && (
        <p className="rounded-xl border border-ember/40 bg-ember/10 p-3 text-sm text-ember">
          Authentication isn&apos;t fully configured yet. The site owner needs to add
          the Supabase API keys.
        </p>
      )}
      {isSignup && (
        <>
          <Field label="Full name" error={form.formState.errors.fullName?.message}>
            <input {...form.register("fullName")} className={inputCls} placeholder="Your name" />
          </Field>
          <Field label="Phone" error={form.formState.errors.phone?.message}>
            <input {...form.register("phone")} className={inputCls} placeholder="Phone number" inputMode="tel" />
          </Field>
        </>
      )}
      <Field label="Email" error={form.formState.errors.email?.message}>
        <input {...form.register("email")} className={inputCls} placeholder="you@email.com" autoComplete="email" />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <input
          {...form.register("password")}
          type="password"
          className={inputCls}
          placeholder="••••••••"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </Field>
      {!isSignup && (
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-muted hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
      )}
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="mt-2 w-full">
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSignup ? "Create account" : "Log in"}
      </Button>
      {serverError && (
        <p className="text-center text-sm text-ember" role="alert">
          {serverError}
        </p>
      )}
      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already a member?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
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
