import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { services, getService } from "@/config/services";
import { PageHeader } from "@/components/marketing/page-header";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { CtaBand } from "@/components/marketing/cta-band";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} in Faridabad`,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
          { name: service.name, href: `/services/${service.slug}` },
        ]}
      />
      <PageHeader
        eyebrow={service.category}
        title={
          <span className="flex flex-wrap items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Icon name={service.icon} className="size-7" />
            </span>
            {service.name}
          </span>
        }
        description={service.tagline}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name, href: `/services/${service.slug}` },
        ]}
      />

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="prose-invert max-w-none">
            <p className="text-lg text-foreground/90">{service.description}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {service.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-4">
                  <Check className="size-5 shrink-0 text-primary" />
                  <span className="text-sm">{h}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/join?trial=1">
                Try it free <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/schedule" variant="outline">
                View class schedule
              </ButtonLink>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
            <Image
              src={service.image}
              alt={`${service.name} at 93 Cross Fitness`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </Reveal>
      </section>

      <section className="container-x py-10">
        <h2 className="mb-6 text-2xl">Explore more programs</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              href={`/services/${r.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-border bg-surface/60 p-6 transition-colors hover:border-primary/50"
            >
              <span className="flex items-center gap-3">
                <Icon name={r.icon} className="size-5 text-primary" />
                <span className="font-display uppercase">{r.name}</span>
              </span>
              <ArrowRight className="size-4 text-muted-2 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
        <Link href="/services" className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to all services
        </Link>
      </section>

      <CtaBand />
    </>
  );
}
