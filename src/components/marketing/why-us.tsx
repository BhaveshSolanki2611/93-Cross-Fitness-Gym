import { BadgeCheck, Sparkles, Users, ShieldCheck } from "lucide-react";
import { EyebrowBadge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/card";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

const features = [
  {
    icon: BadgeCheck,
    title: "Certified coaches",
    body: "Every trainer is certified, supportive and obsessed with your form and progress.",
  },
  {
    icon: Sparkles,
    title: "Spotless & premium",
    body: "Clean, well-maintained equipment and facilities you'll actually look forward to.",
  },
  {
    icon: Users,
    title: "Real community",
    body: "A motivating crew and 25+ weekly classes that keep you accountable and coming back.",
  },
  {
    icon: ShieldCheck,
    title: "Honest value",
    body: "Transparent, flexible memberships with genuine value — no hidden catches.",
  },
];

export function WhyUs() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-radial-fade opacity-60" />
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionHeading
              eyebrow={<EyebrowBadge>Why 93 Cross Fitness</EyebrowBadge>}
              title={
                <>
                  More than a gym —<br />
                  <span className="text-volt">a performance culture</span>
                </>
              }
              description="We combine world-class equipment, expert coaching and a recovery-first mindset so you train smarter, stay consistent, and see results that last."
            />
          </Reveal>

          <StaggerGroup className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface/60 p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="text-lg">{f.title}</h3>
                  <p className="text-sm text-muted">{f.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
