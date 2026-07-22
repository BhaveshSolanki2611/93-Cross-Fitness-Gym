import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Calculators } from "@/components/tools/calculators";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Free Fitness Calculators — BMI, Body Fat & Calories",
  description:
    "Free BMI, body fat and calorie (TDEE) calculators from 93 Cross Fitness Gym & Spa, Faridabad. Know your numbers, then let our coaches build your plan.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free tools"
        title={<>Know your <span className="text-volt">numbers</span></>}
        description="Quick, free calculators to understand where you stand today. Then talk to our coaches to build a plan around your goals."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tools", href: "/tools" }]}
      />
      <section className="container-x py-16">
        <Calculators />
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-2">
          These calculators provide general estimates for informational purposes only
          and are not medical advice. Consult a qualified professional before starting
          any fitness or nutrition program.
        </p>
      </section>
      <CtaBand />
    </>
  );
}
