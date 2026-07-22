import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EyebrowBadge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
}) {
  return (
    <header className="relative overflow-hidden border-b border-border pt-28 pb-14 md:pt-36 md:pb-20">
      <div className="absolute inset-0 -z-10 bg-grid opacity-70" />
      <div className="absolute inset-0 -z-10 bg-radial-fade" />
      <div className="container-x">
        {breadcrumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-2">
              {breadcrumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3" />}
                  <Link href={c.href} className="hover:text-foreground">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && (
          <div className="mb-5">
            <EyebrowBadge>{eyebrow}</EyebrowBadge>
          </div>
        )}
        <h1 className="max-w-4xl text-4xl leading-[1.02] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg text-muted">{description}</p>
        )}
      </div>
    </header>
  );
}
