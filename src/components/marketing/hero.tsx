"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutExpo } },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-16">
      {/* Background layers */}
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url(/images/stock/hero-gym.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      <div className="absolute inset-0 -z-10 bg-grid" />
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-background to-transparent" />

      <div className="container-x grid items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr]">
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.div variants={item}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-2/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
              <span className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-primary text-primary" />
                ))}
              </span>
              {siteConfig.ratings.value}★ · {siteConfig.ratings.count}+ Google reviews
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl leading-[0.95] sm:text-6xl md:text-7xl xl:text-8xl"
          >
            Forge your
            <br />
            <span className="text-volt">strongest</span> self
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg text-muted"
          >
            Faridabad&apos;s premium gym &amp; spa in Sector 82. CrossFit, HIIT,
            strength, yoga, dance and recovery — with certified coaches and
            world-class equipment.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <ButtonLink href="/join?trial=1" size="lg">
              Claim your free trial <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/pricing" variant="outline" size="lg">
              View membership plans
            </ButtonLink>
          </motion.div>

          <motion.dl
            variants={item}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8"
          >
            {[
              { n: "2,000+", l: "Members trained" },
              { n: "25+", l: "Weekly classes" },
              { n: "12+", l: "Expert trainers" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl text-foreground sm:text-4xl">
                  {s.n}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-muted">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* Visual panel — 3D scene mounts here (progressively enhanced) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: easeOutExpo, delay: 0.2 }}
          className="relative hidden aspect-square w-full lg:block"
        >
          <HeroVisual />
        </motion.div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-2 md:flex">
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
}

/**
 * Lightweight CSS/SVG visual used as the hero centrepiece and as an instant
 * placeholder while the heavier 3D scene lazy-loads.
 */
function HeroVisual() {
  return (
    <div className="relative flex size-full items-center justify-center">
      <div className="absolute size-[78%] rounded-full border border-border-strong" />
      <div className="absolute size-[92%] rounded-full border border-border" />
      <motion.div
        aria-hidden
        className="absolute size-[60%] rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        viewBox="0 0 200 200"
        className="relative size-2/3 text-primary drop-shadow-[0_0_40px_rgba(200,244,58,0.35)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        fill="none"
      >
        <path
          d="M40 100h20M140 100h20M60 80h10v40H60zM130 80h10v40h-10zM70 96h60v8H70z"
          fill="currentColor"
        />
      </motion.svg>
    </div>
  );
}
