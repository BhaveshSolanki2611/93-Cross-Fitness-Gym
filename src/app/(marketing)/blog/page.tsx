import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { blogPosts } from "@/config/blog";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Fitness Blog",
  description:
    "Training, nutrition and wellness tips from the coaches at 93 Cross Fitness Gym & Spa, Faridabad. Guides on CrossFit, HIIT, fat loss and more.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title={<>The <span className="text-volt">93 Cross</span> blog</>}
        description="Practical training, nutrition and wellness advice from our coaches — written for real life in Faridabad."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }]}
      />
      <section className="container-x py-16">
        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((p) => (
            <StaggerItem key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface/60 transition-colors hover:border-primary/50"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={p.cover}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-2">
                    <span className="text-primary">{p.category}</span>
                    <span>·</span>
                    <span>{p.readingTime}</span>
                  </div>
                  <h2 className="mt-3 text-xl leading-tight">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-2">
                    <span>{formatDate(p.date)}</span>
                    <ArrowUpRight className="size-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}
