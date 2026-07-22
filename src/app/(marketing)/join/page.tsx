import type { Metadata } from "next";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { JoinForm } from "@/components/marketing/join-form";

export const metadata: Metadata = {
  title: "Join / Book",
  description:
    "Join 93 Cross Fitness Gym & Spa or book a free trial, personal training, class or spa appointment in Sector 82, Faridabad.",
  alternates: { canonical: "/join" },
};

const perks = [
  "Free first session & facility tour",
  "Certified, motivating coaches",
  "25+ weekly classes included on Pro & Elite",
  "Flexible monthly, quarterly & annual plans",
  "Spa & recovery to train smarter",
];

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get started"
        title={<>Book your <span className="text-volt">free trial</span></>}
        description="Fill in your details and we'll confirm your slot. Zero pressure — just come experience it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Join", href: "/join" }]}
      />
      <section className="container-x grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-2xl">Why members choose us</h2>
          <ul className="mt-6 flex flex-col gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <Check className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-foreground/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-surface/60 p-8">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2" />}>
            <JoinForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
