import { ArrowRight, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/config/site";

export function CtaBand() {
  return (
    <section className="container-x pb-8 pt-4">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-surface-2 to-surface p-10 text-center md:p-16">
          <div className="absolute inset-0 -z-10 bg-radial-fade" />
          <h2 className="mx-auto max-w-3xl text-4xl leading-tight sm:text-5xl md:text-6xl">
            Your first session is <span className="text-volt">on us</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            Book a free trial, tour the facility, and meet the coaches. No
            pressure — just come see why Faridabad trains here.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/join?trial=1" size="lg">
              Book free trial <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href={`tel:${siteConfig.contact.phonePrimary}`}
              variant="secondary"
              size="lg"
            >
              <Phone className="size-4" /> {siteConfig.contact.phonePrimaryDisplay}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
