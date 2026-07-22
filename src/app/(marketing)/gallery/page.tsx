import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/marketing/page-header";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { CtaBand } from "@/components/marketing/cta-band";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Take a look inside 93 Cross Fitness Gym & Spa, Faridabad — our training floor, group classes, equipment and spa.",
  alternates: { canonical: "/gallery" },
};

/**
 * Stock imagery (Unsplash license) representing our programs & equipment.
 * Swap with real gym photos in /images/real when the owner provides them.
 */
const tiles = [
  { src: "/images/stock/dark-gym.jpg", label: "Training floor", span: "sm:col-span-2 sm:row-span-2" },
  { src: "/images/stock/crossfit.jpg", label: "CrossFit box" },
  { src: "/images/stock/zumba.jpg", label: "Group class" },
  { src: "/images/stock/weights-rack.jpg", label: "Strength zone" },
  { src: "/images/stock/yoga-2.jpg", label: "Yoga studio" },
  { src: "/images/stock/spa.jpg", label: "Spa & recovery", span: "sm:col-span-2" },
  { src: "/images/stock/cycling.jpg", label: "Cycling studio" },
  { src: "/images/stock/kettlebell.jpg", label: "Functional zone" },
  { src: "/images/stock/equipment-1.jpg", label: "Equipment" },
  { src: "/images/stock/barbell-lift.jpg", label: "Lifting platform", span: "sm:col-span-2" },
  { src: "/images/stock/equipment-3.jpg", label: "Accessories" },
  { src: "/images/stock/personal-training.jpg", label: "Personal training" },
];

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title={<>Step <span className="text-volt">inside</span></>}
        description="A glimpse of the space, the energy and the community. Follow us for daily reels and updates."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery", href: "/gallery" }]}
      />

      <section className="container-x py-16">
        <StaggerGroup className="grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-4">
          {tiles.map((t) => (
            <StaggerItem key={t.label} className={t.span}>
              <div className="group relative size-full overflow-hidden rounded-2xl">
                <Image
                  src={t.src}
                  alt={`${t.label} — 93 Cross Fitness`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 640px) 25vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-widest text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {t.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-muted">
            See more on Instagram{" "}
            <span className="text-primary">{siteConfig.socials.instagramHandle}</span>
          </p>
          <ButtonLink href={siteConfig.socials.instagram} variant="outline">
            Follow us on Instagram
          </ButtonLink>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
