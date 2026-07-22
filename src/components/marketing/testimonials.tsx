"use client";

import { Star } from "lucide-react";
import { testimonials } from "@/config/testimonials";
import { EyebrowBadge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/card";
import { Reveal } from "@/components/motion/reveal";

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow={<EyebrowBadge>Loved by our members</EyebrowBadge>}
            title={
              <>
                Real results, <span className="text-volt">real people</span>
              </>
            }
            description="Rated 4.8★ across 199+ Google reviews. Here's what the 93 Cross Fitness community says."
          />
        </Reveal>
      </div>

      <div className="relative mt-14 flex flex-col gap-4 overflow-hidden">
        <MarqueeRow items={testimonials.slice(0, 3)} />
        <MarqueeRow items={testimonials.slice(3)} reverse />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  reverse,
}: {
  items: typeof testimonials;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className="flex w-max gap-4 animate-marquee"
      style={reverse ? { animationDirection: "reverse" } : undefined}
    >
      {doubled.map((t, i) => (
        <figure
          key={i}
          className="flex w-[340px] shrink-0 flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-6"
        >
          <div className="flex gap-0.5 text-primary">
            {Array.from({ length: t.rating }).map((_, j) => (
              <Star key={j} className="size-4 fill-primary" />
            ))}
          </div>
          <blockquote className="text-sm text-foreground/90">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-auto flex items-center gap-3 pt-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-display text-sm text-primary">
              {t.name.charAt(0)}
            </span>
            <span>
              <span className="block text-sm font-semibold">{t.name}</span>
              <span className="block text-xs text-muted-2">{t.role}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
