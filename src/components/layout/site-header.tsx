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
          ? "border-b border-white/10 bg-[#08080a]/95 backdrop-blur-xl shadow-xl shadow-black/40"
          : "border-b border-white/5 bg-[#08080a]/75 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 md:h-20 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Logo className="shrink-0" />

        {/* Desktop Navigation (visible 1024px lg and above) */}
        <nav className="hidden items-center justify-center gap-0.5 lg:flex flex-1 px-3 min-w-0">
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
                  "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] lg:text-xs xl:px-3 xl:py-1.5 xl:text-xs 2xl:px-3.5 2xl:text-sm font-semibold uppercase tracking-wider transition-all shrink-0",
                  active
                    ? "bg-primary text-black font-bold shadow-sm"
                    : "text-zinc-300 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Actions (visible 1024px lg and above) */}
        <div className="hidden items-center gap-2 lg:flex shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-1.5 shrink-0 whitespace-nowrap rounded-full border border-primary/40 px-3 py-1.5 text-xs xl:text-sm font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-black"
          >
            <LogIn className="size-3.5" />
            <span>Login</span>
          </Link>
          <a
            href={`tel:${siteConfig.contact.phonePrimary}`}
            className="hidden 2xl:flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <Phone className="size-3.5 text-primary" />
            <span>{siteConfig.contact.phonePrimaryDisplay}</span>
          </a>
          <ButtonLink href="/join" size="sm" className="shrink-0 whitespace-nowrap shadow-md font-bold">
            Join Now
          </ButtonLink>
        </div>

        {/* Mobile & Tablet Right Controls (< 1024px) */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary transition-all hover:bg-primary hover:text-black"
          >
            <LogIn className="size-3.5" />
            <span>Login</span>
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Sheet */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />

            {/* Sliding Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-[101] flex w-[85%] max-w-xs sm:max-w-sm flex-col bg-[#0c0c0e] border-l border-white/15 p-6 shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="mb-6 flex items-center justify-between pb-4 border-b border-white/10">
                <Logo />
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15 active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-2">
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
                        "rounded-xl px-4 py-3 text-base font-display uppercase tracking-wider transition-all flex items-center justify-between",
                        active
                          ? "bg-primary text-black font-bold border border-primary shadow-md"
                          : "text-white hover:bg-white/10 hover:text-primary"
                      )}
                    >
                      <span>{item.label}</span>
                      {active && <span className="size-2 rounded-full bg-black" />}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Action CTAs */}
              <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-white/10">
                <ButtonLink href="/login" variant="outline" size="lg" className="w-full justify-center text-primary border-primary/40 hover:bg-primary hover:text-black">
                  <LogIn className="size-4" /> Member Login
                </ButtonLink>
                <ButtonLink href="/join" size="lg" className="w-full justify-center font-bold">
                  Join Now
                </ButtonLink>
                <ButtonLink
                  href={`tel:${siteConfig.contact.phonePrimary}`}
                  variant="outline"
                  size="lg"
                  className="w-full justify-center text-zinc-300 border-white/20 hover:bg-white/10"
                >
                  <Phone className="size-4" /> Call Us
                </ButtonLink>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}



