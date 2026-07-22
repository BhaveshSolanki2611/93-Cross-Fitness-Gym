import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getUserProfile, isStaffRole } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PortalNav } from "@/components/portal/portal-nav";
import type { NavItemData } from "@/components/portal/portal-nav";

export const metadata: Metadata = {
  title: "Member Portal",
  robots: { index: false, follow: false },
};

const nav: NavItemData[] = [
  { href: "/portal", label: "Overview", iconName: "LayoutDashboard" },
  { href: "/portal/classes", label: "Classes", iconName: "CalendarDays" },
  { href: "/portal/membership", label: "Membership", iconName: "RefreshCcw" },
  { href: "/portal/payments", label: "Payments", iconName: "CreditCard" },
  { href: "/portal/attendance", label: "Attendance", iconName: "CalendarCheck" },
  { href: "/portal/profile", label: "Profile", iconName: "UserRound" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal");
  const { profile } = session;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            {isStaffRole(profile.role) && (
              <Link
                href="/admin"
                className="hidden items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary sm:flex"
              >
                <ShieldCheck className="size-4" /> Admin Panel
              </Link>
            )}
            <span className="hidden text-sm text-muted md:block">
              {profile.full_name ?? profile.email}
            </span>
            <SignOutButton />
          </div>
        </div>
        <PortalNav items={nav} />
      </header>
      <main className="container-x py-10">{children}</main>
    </div>
  );
}
