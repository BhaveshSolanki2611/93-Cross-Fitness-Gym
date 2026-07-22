import type { Metadata } from "next";
import { LegalDoc } from "@/components/marketing/legal-doc";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms governing membership and use of ${siteConfig.name} facilities and website.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms & Conditions"
      updated="12 July 2026"
      slug="terms"
      sections={[
        {
          heading: "Agreement",
          body: [
            `By using our website or facilities, you agree to these terms. This is a template and should be reviewed by a legal professional before you rely on it.`,
          ],
        },
        {
          heading: "Membership",
          body: [
            "Memberships are personal and non-transferable unless stated otherwise. Access is subject to the plan you purchase and our operating hours.",
            "We reserve the right to amend class schedules, pricing and facilities. Members will be notified of material changes.",
          ],
        },
        {
          heading: "Health & safety",
          body: [
            "You confirm you are medically fit to exercise. Please consult a doctor before beginning any new fitness program. Follow staff instructions and use equipment responsibly.",
            `${siteConfig.name} is not liable for injury resulting from improper use of equipment or failure to follow guidance, to the extent permitted by law.`,
          ],
        },
        {
          heading: "Conduct",
          body: [
            "We expect respectful behaviour towards staff and members. We may suspend or terminate memberships for misconduct.",
          ],
        },
        {
          heading: "Contact",
          body: [
            `Questions about these terms? Contact ${siteConfig.contact.email} or ${siteConfig.contact.phonePrimaryDisplay}.`,
          ],
        },
      ]}
    />
  );
}
