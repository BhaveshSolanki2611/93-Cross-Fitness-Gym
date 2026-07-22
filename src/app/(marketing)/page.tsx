import { Hero } from "@/components/marketing/hero";
import { Marquee } from "@/components/marketing/marquee";
import { ServicesOverview } from "@/components/marketing/services-overview";
import { WhyUs } from "@/components/marketing/why-us";
import { Testimonials } from "@/components/marketing/testimonials";
import { CtaBand } from "@/components/marketing/cta-band";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <ServicesOverview />
      <WhyUs />
      <Testimonials />
      <CtaBand />
    </>
  );
}
