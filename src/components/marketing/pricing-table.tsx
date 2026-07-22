"use client";

import * as React from "react";
import { Check, X, Star } from "lucide-react";
import { pricingPlans, planComparison } from "@/config/pricing";
import { ButtonLink } from "@/components/ui/button";
import { cn, formatINR } from "@/lib/utils";

type Term = "monthly" | "quarterly" | "yearly";
const terms: { id: Term; label: string; note?: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly", note: "Best value" },
];

export function PricingTable() {
  const [term, setTerm] = React.useState<Term>("monthly");

  return (
    <div>
      <div className="mb-12 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          {terms.map((t) => (
            <button
              key={t.id}
              onClick={() => setTerm(t.id)}
              className={cn(
                "relative rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
                term === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {t.label}
              {t.note && (
                <span className="ml-1.5 hidden text-[10px] font-bold text-primary sm:inline">
                  {term === t.id ? "" : t.note}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => {
          const price = plan[term];
          const suffix = term === "monthly" ? "/mo" : term === "quarterly" ? "/quarter" : "/year";
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl border p-8",
                plan.featured
                  ? "border-primary bg-gradient-to-b from-primary/[0.08] to-surface shadow-[0_0_60px_rgba(200,244,58,0.12)]"
                  : "border-border bg-surface/60"
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                  <Star className="size-3 fill-current" /> Most popular
                </span>
              )}
              <h3 className="text-2xl">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="font-display text-5xl">{formatINR(price)}</span>
                <span className="mb-1.5 text-sm text-muted">{suffix}</span>
              </div>
              <ul className="mt-8 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={`/join?plan=${plan.id}&term=${term}`}
                variant={plan.featured ? "primary" : "secondary"}
                size="lg"
                className="mt-8 w-full"
              >
                {plan.cta}
              </ButtonLink>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="mt-20 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-4 text-left font-display text-lg uppercase">Compare plans</th>
              {pricingPlans.map((p) => (
                <th key={p.id} className="py-4 text-center font-display text-lg uppercase">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planComparison.map((row) => (
              <tr key={row.feature} className="border-b border-border">
                <td className="py-4 text-muted">{row.feature}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="py-4 text-center">
                    {typeof v === "boolean" ? (
                      v ? (
                        <Check className="mx-auto size-5 text-primary" />
                      ) : (
                        <X className="mx-auto size-5 text-muted-2" />
                      )
                    ) : (
                      <span className="text-foreground/90">{v}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
