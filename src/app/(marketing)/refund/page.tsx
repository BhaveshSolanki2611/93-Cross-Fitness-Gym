import type { Metadata } from "next";
import { LegalDoc } from "@/components/marketing/legal-doc";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: `Refund, cancellation and membership freeze policy for ${siteConfig.name}.`,
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <LegalDoc
      title="Refund & Cancellation Policy"
      updated="12 July 2026"
      slug="refund"
      sections={[
        {
          heading: "Overview",
          body: [
            "This policy explains refunds, cancellations and freezes for memberships and bookings. This is a template and should be reviewed by a legal professional before you rely on it.",
          ],
        },
        {
          heading: "Membership refunds",
          body: [
            "Membership fees are generally non-refundable once activated, except where required by law. Specific terms may apply to promotional plans.",
          ],
        },
        {
          heading: "Cancellations",
          body: [
            "You may cancel a booked session or appointment by contacting us in advance. Late cancellations or no-shows for personal training or spa may be charged.",
          ],
        },
        {
          heading: "Membership freeze",
          body: [
            "Eligible members may freeze their membership for reasons such as travel or medical needs, subject to approval by our team.",
          ],
        },
        {
          heading: "How to request",
          body: [
            `To request a refund, cancellation or freeze, contact ${siteConfig.contact.email} or ${siteConfig.contact.phonePrimaryDisplay}.`,
          ],
        },
      ]}
    />
  );
}
