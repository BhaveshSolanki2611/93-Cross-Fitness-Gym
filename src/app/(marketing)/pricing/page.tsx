import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { PricingTable } from "@/components/marketing/pricing-table";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Membership Plans & Pricing",
  description:
    "Flexible gym membership plans at 93 Cross Fitness Gym & Spa, Sector 82 Faridabad — Starter, Pro and Elite with monthly, quarterly and annual options.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title={<>Simple plans, <span className="text-volt">serious results</span></>}
        description="Pick a plan that fits your goals and budget. No hidden fees — and your first session is always free."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }]}
      />
      <section className="container-x py-16">
        <PricingTable />
      </section>
      <CtaBand />
    </>
  );
}
