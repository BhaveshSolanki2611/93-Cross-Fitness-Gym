"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Footprints, Check } from "lucide-react";
import { checkInMember } from "@/app/actions/admin";

export function CheckInButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "busy" | "done">("idle");

  async function onClick() {
    setState("busy");
    const res = await checkInMember(memberId);
    if (res.ok) {
      setState("done");
      router.refresh();
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("idle");
      alert(res.error ?? "Check-in failed");
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={state !== "idle"}
      className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
    >
      {state === "busy" ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : state === "done" ? (
        <Check className="size-3.5 text-primary" />
      ) : (
        <Footprints className="size-3.5" />
      )}
      {state === "done" ? "Checked in" : "Check in"}
    </button>
  );
}
