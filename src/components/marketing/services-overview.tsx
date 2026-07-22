import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/config/services";
import { EyebrowBadge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export function ServicesOverview() {
  return (
    <section className="container-x py-24">
      <Reveal>
        <SectionHeading
          eyebrow={<EyebrowBadge>What we offer</EyebrowBadge>}
          title={
            <>
              Programs built to <span className="text-volt">transform</span> you
            </>
          }
          description="From high-intensity CrossFit to restorative spa recovery — pick your path or blend them all. Every program is coached by certified experts."
        />
      </Reveal>

      <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <StaggerItem key={s.slug}>
            <Link
              href={`/services/${s.slug}`}
              className="group flex h-full flex-col justify-between gap-8 rounded-2xl border border-border bg-surface/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-surface-2/60"
            >
              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={s.icon} className="size-6" />
                </span>
                <ArrowUpRight className="size-5 text-muted-2 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <div>
                <h3 className="text-xl">{s.name}</h3>
                <p className="mt-2 text-sm text-muted">{s.summary}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
