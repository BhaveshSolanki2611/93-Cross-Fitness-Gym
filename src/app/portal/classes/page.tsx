import { redirect } from "next/navigation";
import { CalendarDays, Clock, Flame, UserRound } from "lucide-react";
import { getUserProfile } from "@/lib/supabase/server";
import { query } from "@/lib/db";
import { BookSlotButton, CancelBookingButton } from "@/components/portal/class-booking";

export const dynamic = "force-dynamic";

interface Slot {
  id: string;
  title: string;
  service_slug: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  intensity: string | null;
  trainer_name: string | null;
}

export default async function PortalClasses() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal/classes");

  // Week window: today .. +6 days (server-local dates as YYYY-MM-DD).
  const days: { date: string; dow: number; label: string }[] = [];
  const base = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    days.push({
      date: iso,
      dow: d.getDay(),
      label:
        i === 0
          ? "Today"
          : i === 1
            ? "Tomorrow"
            : d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }),
    });
  }
  const first = days[0].date;
  const last = days[days.length - 1].date;

  const [slots, counts, mine] = await Promise.all([
    query<Slot>(
      `select s.id, s.title, s.service_slug, s.day_of_week,
              s.start_time::text, s.end_time::text, s.capacity, s.intensity,
              t.full_name as trainer_name
         from class_schedule s
         left join trainers t on t.id = s.trainer_id
        where s.is_active = true
        order by s.start_time`
    ),
    query<{ class_schedule_id: string; preferred_date: string; n: string }>(
      `select class_schedule_id, preferred_date::text, count(*)::text as n
         from bookings
        where preferred_date between $1 and $2
          and class_schedule_id is not null
          and status in ('pending','confirmed')
        group by 1, 2`,
      [first, last]
    ),
    query<{
      id: string;
      preferred_date: string;
      class_schedule_id: string;
      title: string;
      start_time: string;
      status: string;
    }>(
      `select b.id, b.preferred_date::text, b.class_schedule_id, s.title, s.start_time::text, b.status
         from bookings b
         join members m on m.id = b.member_id and m.profile_id = $1
         join class_schedule s on s.id = b.class_schedule_id
        where b.preferred_date >= $2
          and b.status in ('pending','confirmed')
        order by b.preferred_date, s.start_time`,
      [session.user.id, first]
    ),
  ]);

  const countFor = new Map(
    counts.map((c) => [`${c.class_schedule_id}|${c.preferred_date}`, Number(c.n)])
  );
  const mineKeys = new Set(mine.map((b) => `${b.class_schedule_id}|${b.preferred_date}`));

  const fmtTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const am = h < 12;
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl">Book a class</h1>
        <p className="mt-1 text-muted">Reserve your spot for the week ahead.</p>
      </div>

      {mine.length > 0 && (
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-6">
          <h2 className="mb-4 text-lg">Your upcoming classes</h2>
          <ul className="flex flex-col gap-3">
            {mine.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm"
              >
                <span className="font-semibold">{b.title}</span>
                <span className="text-muted">
                  {new Date(`${b.preferred_date}T00:00:00`).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {fmtTime(b.start_time)}
                </span>
                <CancelBookingButton bookingId={b.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {days.map((day) => {
        const daySlots = slots.filter((s) => s.day_of_week === day.dow);
        if (daySlots.length === 0) return null;
        return (
          <section key={day.date}>
            <h2 className="mb-3 flex items-center gap-2 text-lg">
              <CalendarDays className="size-5 text-primary" />
              {day.label}
            </h2>
            <div className="overflow-hidden rounded-3xl border border-border bg-surface/60">
              <ul className="divide-y divide-border">
                {daySlots.map((slot) => {
                  const taken = countFor.get(`${slot.id}|${day.date}`) ?? 0;
                  const left = Math.max(0, slot.capacity - taken);
                  const booked = mineKeys.has(`${slot.id}|${day.date}`);
                  return (
                    <li
                      key={slot.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{slot.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                          </span>
                          {slot.trainer_name && (
                            <span className="inline-flex items-center gap-1">
                              <UserRound className="size-3.5" />
                              {slot.trainer_name}
                            </span>
                          )}
                          {slot.intensity && (
                            <span className="inline-flex items-center gap-1">
                              <Flame className="size-3.5" />
                              {slot.intensity}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-2">
                          {left} spot{left === 1 ? "" : "s"} left
                        </span>
                        <BookSlotButton
                          scheduleId={slot.id}
                          date={day.date}
                          full={left === 0}
                          booked={booked}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
