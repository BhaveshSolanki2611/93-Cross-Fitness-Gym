import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about membership, timings, classes, trainers, spa and free trials at 93 Cross Fitness Gym & Spa, Sector 82 Faridabad.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <PageHeader
        eyebrow="Questions"
        title={<>Frequently asked <span className="text-volt">questions</span></>}
        description="Everything you need to know before you join. Still curious? Message us on WhatsApp."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ", href: "/faq" }]}
      />
      <section className="container-x max-w-3xl py-16">
        <FaqAccordion />
      </section>
      <CtaBand />
    </>
  );
}
