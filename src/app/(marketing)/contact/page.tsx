import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { ContactForm } from "@/components/marketing/contact-form";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact & Location",
  description:
    "Visit 93 Cross Fitness Gym & Spa at Sector 82, Faridabad. Call 099903 00093, message us on WhatsApp, or send an enquiry — we'd love to meet you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const waText = encodeURIComponent("Hi! I'd like to know more about 93 Cross Fitness.");
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title={<>Come <span className="text-volt">train with us</span></>}
        description="Questions, a free trial, or a facility tour — reach out however suits you. We're in Sector 82, Faridabad."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]}
      />

      <section className="container-x grid gap-10 py-16 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={MapPin} title="Visit us">
              {siteConfig.address.full}
            </InfoCard>
            <InfoCard icon={Clock} title="Hours">
              Open daily · 5:00 AM – 9:00 PM
            </InfoCard>
            <a href={`tel:${siteConfig.contact.phonePrimary}`}>
              <InfoCard icon={Phone} title="Call" interactive>
                {siteConfig.contact.phonePrimaryDisplay}
                <br />
                {siteConfig.contact.phoneSecondaryDisplay}
              </InfoCard>
            </a>
            <a href={`mailto:${siteConfig.contact.email}`}>
              <InfoCard icon={Mail} title="Email" interactive>
                {siteConfig.contact.email}
              </InfoCard>
            </a>
          </div>

          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 font-semibold uppercase tracking-wide text-white transition-transform hover:scale-[1.01]"
          >
            <MessageCircle className="size-5" /> Chat on WhatsApp
          </a>

          <div className="overflow-hidden rounded-3xl border border-border">
            <iframe
              title="93 Cross Fitness location map"
              src={siteConfig.address.mapsEmbedSrc}
              width="100%"
              height="320"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface/60 p-8">
          <h2 className="text-2xl">Send us a message</h2>
          <p className="mt-1 text-sm text-muted">We usually reply within a few hours.</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
  interactive,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={
        "flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-5 " +
        (interactive ? "transition-colors hover:border-primary/50" : "")
      }
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-2">{title}</div>
        <div className="mt-1 text-sm text-foreground/90">{children}</div>
      </div>
    </div>
  );
}
