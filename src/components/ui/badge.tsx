import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-2/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function EyebrowBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge className="text-primary">
      <span className="inline-block size-1.5 rounded-full bg-primary" />
      {children}
    </Badge>
  );
}
