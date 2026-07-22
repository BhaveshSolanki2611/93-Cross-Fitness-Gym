import type { Metadata } from "next";
import { LegalDoc } from "@/components/marketing/legal-doc";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="12 July 2026"
      slug="privacy"
      sections={[
        {
          heading: "Overview",
          body: [
            `${siteConfig.name} ("we", "us") respects your privacy. This policy explains what personal data we collect and how we use it. This is a template and should be reviewed by a legal professional before you rely on it.`,
          ],
        },
        {
          heading: "Information we collect",
          body: [
            "We may collect your name, phone number, email address, and information you provide when enquiring, booking a trial, or signing up for a membership.",
            "For members, we may also store attendance, payment records, and fitness/health information you choose to share to deliver our services.",
          ],
        },
        {
          heading: "How we use your information",
          body: [
            "To respond to enquiries, process bookings and memberships, send confirmations and reminders, and improve our services.",
            "We do not sell your personal information to third parties.",
          ],
        },
        {
          heading: "Data security",
          body: [
            "We take reasonable technical and organisational measures to protect your data. No method of transmission or storage is 100% secure.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You may request access to, correction of, or deletion of your personal data by contacting us at " + siteConfig.contact.email + ".",
          ],
        },
        {
          heading: "Contact",
          body: [
            `For any privacy questions, contact us at ${siteConfig.contact.email} or ${siteConfig.contact.phonePrimaryDisplay}.`,
          ],
        },
      ]}
    />
  );
}
