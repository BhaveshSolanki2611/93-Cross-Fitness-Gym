"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-ember hover:text-ember"
      >
        <LogOut className="size-3.5" /> Sign out
      </button>
    </form>
  );
}
