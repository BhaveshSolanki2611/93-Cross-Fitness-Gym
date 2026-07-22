"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  CalendarCheck,
  CalendarDays,
  UserRound,
  RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  CreditCard,
  CalendarCheck,
  CalendarDays,
  UserRound,
  RefreshCcw,
};

export type NavItemData = {
  href: string;
  label: string;
  iconName: string;
};

export function PortalNav({ items }: { items: NavItemData[] }) {
  const pathname = usePathname();

  return (
    <nav className="container-x flex gap-1 overflow-x-auto pb-2">
      {items.map((item) => {
        const isActive = item.href === "/portal" 
          ? pathname === "/portal" 
          : pathname.startsWith(item.href);

        const Icon = iconMap[item.iconName];

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2 hover:text-foreground",
              isActive ? "bg-surface-2 text-foreground" : "text-muted"
            )}
          >
            {Icon && <Icon className="size-4" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
