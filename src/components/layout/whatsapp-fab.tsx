import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function WhatsappFab() {
  const text = encodeURIComponent(
    `Hi ${siteConfig.shortName}! I'd like to know more about membership.`
  );
  return (
    <a
      href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}
