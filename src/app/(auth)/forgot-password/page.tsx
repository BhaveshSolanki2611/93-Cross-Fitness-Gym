import type { Metadata } from "next";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your 93 Cross Fitness member account password.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-border bg-surface/70 p-8 backdrop-blur">
          <h1 className="text-3xl">Reset Password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email to receive a password reset link.
          </p>
          <div className="mt-6">
            <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}>
              <ForgotPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
