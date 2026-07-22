"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(monitoring): report to Sentry / error tracking here.
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <p className="font-display text-7xl text-ember">Oops</p>
      <h1 className="mt-4 text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted">
        An unexpected error occurred. Try again, or head back home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
