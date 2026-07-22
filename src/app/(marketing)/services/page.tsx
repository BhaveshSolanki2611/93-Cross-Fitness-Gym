import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { services, type ServiceCategory } from "@/config/services";
import { Icon } from "@/components/ui/icon";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Services & Programs",
  description:
    "CrossFit, HIIT, personal training, weight training, Zumba, yoga, Pilates, cycling, nutrition and spa — every program you need at 93 Cross Fitness, Sector 82 Faridabad.",
  alternates: { canonical: "/services" },
};

const categoryLabels: Record<ServiceCategory, string> = {
  training: "Strength & Training",
  classes: "Group Classes",
  wellness: "Wellness & Recovery",
};

export default function ServicesPage() {
  const grouped = (Object.keys(categoryLabels) as ServiceCategory[]).map((cat) => ({
    cat,
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Programs"
        title={<>Find your <span className="text-volt">program</span></>}
        description="Whatever your goal — strength, fat loss, flexibility or recovery — there's a coached program here with your name on it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }]}
      />

      {grouped.map(({ cat, items }) => (
        <section key={cat} className="container-x py-14">
          <h2 className="mb-8 text-2xl text-muted-2">{categoryLabels[cat]}</h2>
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <StaggerItem key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon name={s.icon} className="size-6" />
                    </span>
                    <ArrowUpRight className="size-5 text-muted-2 transition-colors group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl">{s.name}</h3>
                    <p className="mt-1 text-sm text-primary/80">{s.tagline}</p>
                    <p className="mt-3 text-sm text-muted">{s.summary}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      ))}

      <CtaBand />
    </>
  );
}
