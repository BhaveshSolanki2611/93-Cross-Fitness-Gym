import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export function CallFab() {
  return (
    <a
      href={`tel:${siteConfig.contact.phonePrimary}`}
      aria-label="Call 93 Cross Fitness"
      className="fixed bottom-[88px] right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-black shadow-[0_10px_30px_rgba(200,244,58,0.45)] transition-transform hover:scale-105 active:scale-95"
    >
      <Phone className="size-6 fill-black" />
    </a>
  );
}
