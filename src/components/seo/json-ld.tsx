import { siteConfig } from "@/config/site";
import { faqs as defaultFaqs, type Faq } from "@/config/faqs";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD is trusted, static content generated on the server.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** LocalBusiness / HealthClub schema — put once in the marketing layout. */
export function LocalBusinessJsonLd() {
  const a = siteConfig.address;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["HealthClub", "SportsActivityLocation", "LocalBusiness"],
        name: siteConfig.name,
        description: siteConfig.description,
        url: siteConfig.url,
        telephone: siteConfig.contact.phonePrimary,
        image: `${siteConfig.url}/opengraph-image`,
        priceRange: "₹₹",
        address: {
          "@type": "PostalAddress",
          streetAddress: `${a.line1}, ${a.line2}`,
          addressLocality: a.city,
          addressRegion: a.state,
          postalCode: a.postalCode,
          addressCountry: a.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: a.geo.lat,
          longitude: a.geo.lng,
        },
        openingHoursSpecification: siteConfig.hours.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.day,
          opens: h.open,
          closes: h.close,
        })),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: siteConfig.ratings.value,
          reviewCount: siteConfig.ratings.count,
        },
        sameAs: [
          siteConfig.socials.instagram,
          siteConfig.socials.facebook,
          siteConfig.socials.youtube,
        ],
      }}
    />
  );
}

export function FaqJsonLd({ items = defaultFaqs }: { items?: Faq[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: `${siteConfig.url}${it.href}`,
        })),
      }}
    />
  );
}
