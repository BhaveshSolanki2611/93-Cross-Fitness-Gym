import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPosts, getPost } from "@/config/blog";
import { PageHeader } from "@/components/marketing/page-header";
import Image from "next/image";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { CtaBand } from "@/components/marketing/cta-band";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { "@type": "Person", name: post.author },
            publisher: { "@type": "Organization", name: siteConfig.name },
            mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
          }),
        }}
      />
      <PageHeader
        eyebrow={post.category}
        title={post.title}
        description={post.excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.category, href: "/blog" },
        ]}
      />
      <article className="container-x max-w-3xl py-16">
        <div className="mb-8 flex items-center gap-3 text-sm text-muted-2">
          <span>By {post.author}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-3xl">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
            priority
          />
        </div>
        <div className="flex flex-col gap-5 text-lg leading-relaxed text-foreground/90">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <Link href="/blog" className="mt-10 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to blog
        </Link>
      </article>
      <CtaBand />
    </>
  );
}
