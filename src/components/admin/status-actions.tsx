"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setBookingStatus, setLeadStatus } from "@/app/actions/admin";

export function BookingActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);

  async function act(next: "confirmed" | "cancelled" | "completed") {
    setBusy(next);
    const res = await setBookingStatus(id, next);
    setBusy(null);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Update failed");
  }

  return (
    <div className="flex justify-end gap-2">
      {status === "pending" && (
        <>
          <ActionBtn onClick={() => act("confirmed")} busy={busy === "confirmed"} tone="primary">
            Confirm
          </ActionBtn>
          <ActionBtn onClick={() => act("cancelled")} busy={busy === "cancelled"} tone="danger">
            Cancel
          </ActionBtn>
        </>
      )}
      {status === "confirmed" && (
        <>
          <ActionBtn onClick={() => act("completed")} busy={busy === "completed"} tone="primary">
            Complete
          </ActionBtn>
          <ActionBtn onClick={() => act("cancelled")} busy={busy === "cancelled"} tone="danger">
            Cancel
          </ActionBtn>
        </>
      )}
    </div>
  );
}

const leadFlow: Record<string, { label: string; next: "contacted" | "trial_booked" | "converted" | "lost" }[]> = {
  new: [
    { label: "Mark contacted", next: "contacted" },
    { label: "Lost", next: "lost" },
  ],
  contacted: [
    { label: "Trial booked", next: "trial_booked" },
    { label: "Lost", next: "lost" },
  ],
  trial_booked: [
    { label: "Converted", next: "converted" },
    { label: "Lost", next: "lost" },
  ],
};

export function LeadActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const actions = leadFlow[status] ?? [];

  async function act(next: "contacted" | "trial_booked" | "converted" | "lost") {
    setBusy(next);
    const res = await setLeadStatus(id, next);
    setBusy(null);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Update failed");
  }

  if (actions.length === 0) return null;
  return (
    <div className="flex justify-end gap-2">
      {actions.map((a) => (
        <ActionBtn
          key={a.next}
          onClick={() => act(a.next)}
          busy={busy === a.next}
          tone={a.next === "lost" ? "danger" : "primary"}
        >
          {a.label}
        </ActionBtn>
      ))}
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  busy,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
  tone: "primary" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-60 " +
        (tone === "primary"
          ? "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
          : "border-border-strong text-muted hover:border-ember hover:text-ember")
      }
    >
      {busy && <Loader2 className="size-3 animate-spin" />}
      {children}
    </button>
  );
}
