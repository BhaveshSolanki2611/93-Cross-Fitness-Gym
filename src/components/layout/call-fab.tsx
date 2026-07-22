import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function CallFab() {
  return (
    <a
      href={`tel:${siteConfig.contact.phonePrimary}`}
      aria-label="Call Us"
      className="fixed bottom-24 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(255,100,0,0.4)] transition-transform hover:scale-105"
    >
      {/* Pulse ring */}
      <span className="absolute inline-flex size-full rounded-full bg-primary opacity-40 animate-ping" />
      <Phone className="relative size-6" />
    </a>
  );
}
