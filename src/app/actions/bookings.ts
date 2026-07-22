"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserProfile } from "@/lib/supabase/server";
import { query } from "@/lib/db";

/**
 * Member class-slot booking. Goes through the pg pool (bypasses RLS) because
 * the capacity check must count OTHER members' bookings, which member-scoped
 * RLS can't see — so every input is validated here and ownership is enforced
 * explicitly before any write.
 */

type Result = { ok: boolean; error?: string };

const bookSchema = z.object({
  scheduleId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function bookClassSlot(input: unknown): Promise<Result> {
  const session = await getUserProfile();
  if (!session) return { ok: false, error: "Please log in first." };

  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  const { scheduleId, date } = parsed.data;

  // Date must be today..+13 days (UTC-date arithmetic on the plain YYYY-MM-DD).
  const target = new Date(`${date}T00:00:00Z`);
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date(`${todayStr}T00:00:00Z`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (Number.isNaN(diffDays) || diffDays < 0 || diffDays > 13) {
    return { ok: false, error: "Pick a date within the next two weeks." };
  }

  // Slot must exist, be active, and fall on that weekday.
  const slots = await query<{
    id: string;
    title: string;
    day_of_week: number;
    capacity: number;
  }>(
    `select id, title, day_of_week, capacity
       from class_schedule where id = $1 and is_active = true`,
    [scheduleId]
  );
  const slot = slots[0];
  if (!slot) return { ok: false, error: "This class is no longer available." };
  if (target.getUTCDay() !== slot.day_of_week) {
    return { ok: false, error: "That date doesn't match this class's weekday." };
  }

  // Contact details: member row first, profile as fallback.
  const members = await query<{ id: string; full_name: string; phone: string | null; email: string | null }>(
    `select id, full_name, phone, email from members
      where profile_id = $1 order by created_at limit 1`,
    [session.user.id]
  );
  const member = members[0] ?? null;
  const name = member?.full_name ?? session.profile.full_name ?? "";
  const phone = member?.phone ?? session.profile.phone ?? "";
  const email = member?.email ?? session.profile.email ?? null;
  if (!name || !phone) {
    return { ok: false, error: "Add your name and phone in Profile first." };
  }

  // No double-booking: same person (member id, else phone) + slot + date.
  const dup = await query<{ id: string }>(
    member
      ? `select id from bookings
          where class_schedule_id = $1 and preferred_date = $2
            and member_id = $3 and status in ('pending','confirmed') limit 1`
      : `select id from bookings
          where class_schedule_id = $1 and preferred_date = $2
            and phone = $3 and status in ('pending','confirmed') limit 1`,
    [scheduleId, date, member ? member.id : phone]
  );
  if (dup.length) return { ok: false, error: "You've already booked this class." };

  // Capacity: pending + confirmed count for that slot occurrence.
  const counts = await query<{ n: string }>(
    `select count(*)::text as n from bookings
      where class_schedule_id = $1 and preferred_date = $2
        and status in ('pending','confirmed')`,
    [scheduleId, date]
  );
  if (Number(counts[0].n) >= slot.capacity) {
    return { ok: false, error: "This class is full for that day." };
  }

  await query(
    `insert into bookings (member_id, type, name, phone, email, class_schedule_id, preferred_date, status)
     values ($1, 'group_class', $2, $3, $4, $5, $6, 'confirmed')`,
    [member?.id ?? null, name, phone, email, scheduleId, date]
  );

  revalidatePath("/portal/classes");
  revalidatePath("/admin/bookings");
  return { ok: true };
}

export async function cancelMyBooking(bookingId: string): Promise<Result> {
  const session = await getUserProfile();
  if (!session) return { ok: false, error: "Please log in first." };
  if (!z.string().uuid().safeParse(bookingId).success) {
    return { ok: false, error: "Invalid booking." };
  }

  // Ownership: booking's member row must belong to this login.
  const updated = await query<{ id: string }>(
    `update bookings b
        set status = 'cancelled'
       from members m
      where b.id = $1
        and b.member_id = m.id
        and m.profile_id = $2
        and b.status in ('pending','confirmed')
      returning b.id`,
    [bookingId, session.user.id]
  );
  if (!updated.length) return { ok: false, error: "Booking not found." };

  revalidatePath("/portal/classes");
  revalidatePath("/admin/bookings");
  return { ok: true };
}
