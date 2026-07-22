import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  MessagesSquare,
  BellRing,
  Receipt,
  Package,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { requireStaff } from "@/lib/auth-guards";
import { Logo } from "@/components/layout/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/leads", label: "Leads", icon: MessagesSquare },
  { href: "/admin/notifications", label: "Notifications", icon: BellRing },
  { href: "/admin/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireStaff();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface/40 p-5 lg:flex">
        <Logo />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-muted hover:text-foreground"
          >
            <ExternalLink className="size-3.5" /> View website
          </Link>
          <div className="text-xs text-muted-2">
            {profile.full_name ?? profile.email}
            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">
              {profile.role.replace("_", " ")}
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <Logo />
            <SignOutButton />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-foreground"
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
