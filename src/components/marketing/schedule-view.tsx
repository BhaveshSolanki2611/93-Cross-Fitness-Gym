"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { schedule, days, type Day } from "@/config/schedule";
import { cn } from "@/lib/utils";

const intensityColor: Record<string, string> = {
  Low: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  Medium: "text-primary border-primary/30 bg-primary/10",
  High: "text-ember border-ember/30 bg-ember/10",
};

function todayName(): Day {
  // Static-safe: default to Monday on the server; hydrate to real day client-side.
  return "Monday";
}

export function ScheduleView() {
  const [active, setActive] = React.useState<Day>(todayName());

  React.useEffect(() => {
    // Intentionally read today's day on the client only, after mount, to
    // auto-select the current day without causing a server/client hydration
    // mismatch (the server has no stable notion of "today" for the visitor).
    const name = new Date().toLocaleDateString("en-US", { weekday: "long" });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (days.includes(name as Day)) setActive(name as Day);
  }, []);

  const slots = schedule
    .filter((s) => s.day === active)
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActive(d)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors",
              active === d
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted hover:text-foreground"
            )}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {slots.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface/60 p-8 text-center text-muted">
            No classes scheduled — enjoy an open gym day!
          </p>
        )}
        {slots.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex w-20 shrink-0 flex-col text-sm">
                <span className="font-display text-lg">{s.start}</span>
                <span className="text-xs text-muted-2">{s.end}</span>
              </div>
              <div>
                <h3 className="text-lg">{s.title}</h3>
                <p className="text-sm text-muted">with {s.trainer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-24 sm:pl-0">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", intensityColor[s.intensity])}>
                {s.intensity}
              </span>
              <span className="hidden items-center gap-1 text-xs text-muted-2 sm:flex">
                <Clock className="size-3" /> 45–60 min
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
