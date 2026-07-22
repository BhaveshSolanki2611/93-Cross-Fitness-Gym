import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { siteConfig, footerNav } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
} from "@/components/ui/brand-icons";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface/40">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr]">
        <div className="flex flex-col gap-6">
          <Logo />
          <p className="max-w-sm text-sm text-muted">{siteConfig.description}</p>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-3 text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{siteConfig.address.full}</span>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.contact.phonePrimary}`}
                className="flex items-center gap-3 text-muted hover:text-foreground"
              >
                <Phone className="size-4 shrink-0 text-primary" />
                {siteConfig.contact.phonePrimaryDisplay} /{" "}
                {siteConfig.contact.phoneSecondaryDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-3 text-muted hover:text-foreground"
              >
                <Mail className="size-4 shrink-0 text-primary" />
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-3 text-muted">
              <Clock className="size-4 shrink-0 text-primary" />
              Open daily · 5:00 AM – 9:00 PM
            </li>
          </ul>
          <div className="flex items-center gap-3">
            <SocialLink href={siteConfig.socials.instagram} label="Instagram">
              <InstagramIcon className="size-4" />
            </SocialLink>
            <SocialLink href={siteConfig.socials.facebook} label="Facebook">
              <FacebookIcon className="size-4" />
            </SocialLink>
            <SocialLink href={siteConfig.socials.youtube} label="YouTube">
              <YoutubeIcon className="size-4" />
            </SocialLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {footerNav.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-2">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-muted-2 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Made for stronger, healthier lives in Faridabad.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full border border-border-strong text-muted transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
