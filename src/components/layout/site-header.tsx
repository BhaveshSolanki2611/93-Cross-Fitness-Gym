"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, mainNav } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Close the mobile menu on route change
  const [prevPath, setPrevPath] = React.useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur-xl shadow-lg shadow-black/20"
          : "border-b border-border/40 bg-background/60 backdrop-blur-md"
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-2 md:h-20">
        {/* Brand Logo */}
        <Logo className="shrink-0" />

        {/* Desktop Navigation (visible 1024px lg and above) */}
        <nav className="hidden items-center justify-center gap-0.5 lg:flex flex-1 px-2">
          {mainNav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] lg:px-3 lg:py-1.5 lg:text-xs xl:text-sm font-semibold uppercase tracking-wider transition-all",
                  active
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-surface-2/80"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions (visible 1024px lg and above) */}
        <div className="hidden items-center gap-2.5 lg:flex shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/40 px-3 py-1.5 text-xs xl:text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <LogIn className="size-3.5" />
            <span>Login</span>
          </Link>
          <a
            href={`tel:${siteConfig.contact.phonePrimary}`}
            className="hidden xl:flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            <Phone className="size-3.5 text-primary" />
            <span>{siteConfig.contact.phonePrimaryDisplay}</span>
          </a>
          <ButtonLink href="/join" size="sm" className="whitespace-nowrap shadow-md">
            Join Now
          </ButtonLink>
        </div>

        {/* Mobile & Tablet Right Controls (< 1024px) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <LogIn className="size-3.5" />
            <span>Login</span>
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-full border border-border-strong bg-surface-2/40 text-foreground transition-colors hover:bg-surface-2"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-y-auto border-l border-border bg-surface/95 p-6 backdrop-blur-2xl shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex size-10 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-surface-2"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1.5">
                {mainNav.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base font-display uppercase tracking-wider transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-foreground hover:bg-surface-2"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-border mt-6">
                <ButtonLink href="/login" variant="outline" size="lg" className="w-full justify-center">
                  <LogIn className="size-4" /> Member Login
                </ButtonLink>
                <ButtonLink href="/join" size="lg" className="w-full justify-center">
                  Join Now
                </ButtonLink>
                <ButtonLink
                  href={`tel:${siteConfig.contact.phonePrimary}`}
                  variant="outline"
                  size="lg"
                  className="w-full justify-center"
                >
                  <Phone className="size-4" /> Call Us
                </ButtonLink>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


