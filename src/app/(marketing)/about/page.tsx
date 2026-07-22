import type { Metadata } from "next";
import Image from "next/image";
import { Target, Heart, Trophy, Leaf } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { SectionHeading } from "@/components/ui/card";
import { EyebrowBadge } from "@/components/ui/badge";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CtaBand } from "@/components/marketing/cta-band";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "93 Cross Fitness Gym & Spa is Sector 82 Faridabad's premium training destination — certified coaches, world-class equipment, and a recovery-first culture.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Target, title: "Results that last", body: "We build sustainable habits and measurable progress — not quick fixes." },
  { icon: Heart, title: "People first", body: "Supportive coaching and a welcoming community for every fitness level." },
  { icon: Trophy, title: "Excellence", body: "Certified trainers, premium equipment and standards we never compromise." },
  { icon: Leaf, title: "Whole wellness", body: "Training, nutrition and spa recovery — a complete approach to your health." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title={<>Built in Faridabad, <span className="text-volt">for Faridabad</span></>}
        description="93 Cross Fitness Gym & Spa was created to give Sector 82 a training home that blends world-class fitness with genuine care and recovery."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]}
      />

      <section className="container-x grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
            <Image
              src="/images/stock/about.jpg"
              alt="Training at 93 Cross Fitness"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SectionHeading
            eyebrow={<EyebrowBadge>Who we are</EyebrowBadge>}
            title="A performance culture with a human heart"
            description="From your first nervous session to your strongest lift, our coaches meet you where you are. We combine CrossFit, strength, group classes, yoga and spa recovery under one roof so you can train hard and recover smart."
          />
          <p className="mt-5 text-muted">
            Rated {siteConfig.ratings.value}★ by {siteConfig.ratings.count}+ members
            on Google, we&apos;re proud of a reputation built on certified trainers,
            spotless facilities and honest value.
          </p>
        </Reveal>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow={<EyebrowBadge>What we stand for</EyebrowBadge>}
            title="Our core values"
          />
        </Reveal>
        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="size-5" />
                </span>
                <h3 className="text-lg">{v.title}</h3>
                <p className="text-sm text-muted">{v.body}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <CtaBand />
    </>
  );
}
