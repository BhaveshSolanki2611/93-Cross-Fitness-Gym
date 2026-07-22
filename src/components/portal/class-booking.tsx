"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { bookClassSlot, cancelMyBooking } from "@/app/actions/bookings";

/** Book button for one class-slot occurrence (slot + concrete date). */
export function BookSlotButton({
  scheduleId,
  date,
  full,
  booked,
}: {
  scheduleId: string;
  date: string; // YYYY-MM-DD
  full: boolean;
  booked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (booked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
        <CheckCircle2 className="size-3.5" /> Booked
      </span>
    );
  }
  if (full) {
    return (
      <span className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted-2">
        Full
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await bookClassSlot({ scheduleId, date });
            if (!res.ok) setError(res.error ?? "Booking failed.");
          })
        }
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <CalendarPlus className="size-3.5" />}
        Book
      </button>
      {error && <span className="text-xs text-ember">{error}</span>}
    </span>
  );
}

/** Cancel button for one of the member's own upcoming bookings. */
export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await cancelMyBooking(bookingId);
            if (!res.ok) setError(res.error ?? "Could not cancel.");
          })
        }
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:border-ember hover:text-ember disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
        Cancel
      </button>
      {error && <span className="text-xs text-ember">{error}</span>}
    </span>
  );
}
