import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" />
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <Logo className="mb-10" />
      <p className="font-display text-8xl text-volt sm:text-9xl">404</p>
      <h1 className="mt-4 text-3xl sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        Looks like this rep doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Back to home</ButtonLink>
        <Link
          href="/contact"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border-strong px-6 text-sm font-semibold uppercase tracking-wide hover:border-primary hover:text-primary"
        >
          Contact us
        </Link>
      </div>
    </main>
  );
}
