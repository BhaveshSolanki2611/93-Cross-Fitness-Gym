import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/marketing/page-header";
import { trainers } from "@/config/trainers";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Our Trainers",
  description:
    "Meet the certified, motivating coaches at 93 Cross Fitness Gym & Spa — experts in CrossFit, strength, yoga, HIIT, dance and nutrition.",
  alternates: { canonical: "/trainers" },
};

export default function TrainersPage() {
  return (
    <>
      <PageHeader
        eyebrow="The team"
        title={<>Coaches who <span className="text-volt">care</span></>}
        description="Certified, experienced and genuinely invested in your progress. Meet the people who'll be in your corner every session."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Trainers", href: "/trainers" }]}
      />

      <section className="container-x py-16">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((t) => (
            <StaggerItem key={t.slug}>
              <article className="group overflow-hidden rounded-3xl border border-border bg-surface/60">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl">{t.name}</h3>
                  <p className="text-sm text-primary/80">{t.role}</p>
                  <p className="mt-3 text-sm text-muted">{t.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {t.specialties.map((s) => (
                      <span key={s} className="rounded-full border border-border-strong px-3 py-1 text-xs text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-widest text-muted-2">
                    {t.certifications.join(" · ")}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <CtaBand />
    </>
  );
}
