import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark logo. Swap for an SVG/image asset when brand art is available. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="93 Cross Fitness Gym & Spa — home"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-primary-foreground">
        93
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold uppercase tracking-tight text-foreground">
          Cross Fitness
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted">
          Gym &amp; Spa
        </span>
      </span>
    </Link>
  );
}
