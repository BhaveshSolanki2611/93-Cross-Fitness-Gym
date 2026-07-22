import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsappFab } from "@/components/layout/whatsapp-fab";
import { CallFab } from "@/components/layout/call-fab";
import { LoginFab } from "@/components/layout/login-fab";
import { LocalBusinessJsonLd } from "@/components/seo/json-ld";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <LocalBusinessJsonLd />
      <SiteHeader />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
      <CallFab />
      <WhatsappFab />
      <LoginFab />
    </SmoothScroll>
  );
}

