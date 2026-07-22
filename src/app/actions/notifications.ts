"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserProfile, isStaffRole } from "@/lib/supabase/server";
import { query } from "@/lib/db";
import { sendNotification, templates, type TemplateKey } from "@/lib/notify";
import { runExpiryReminders } from "@/lib/reminders";

/**
 * Staff-only notification actions. Every send (real, simulated or failed) is
 * recorded in notifications_log for the audit trail.
 */

type Result = { ok: boolean; error?: string; status?: string; sent?: number };

async function requireStaffAction() {
  const session = await getUserProfile();
  if (!session || !isStaffRole(session.profile.role)) return null;
  return session;
}

const sendSchema = z.object({
  memberId: z.string().uuid().optional().or(z.literal("")),
  channel: z.enum(["email", "whatsapp", "sms"]),
  to: z.string().trim().min(5).max(120),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(2).max(2000),
});

export async function sendSingleNotification(input: unknown): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };
  const { memberId, channel, to, subject, message } = parsed.data;

  const outcome = await sendNotification({ channel, to, subject: subject || undefined, message });

  await query(
    `insert into notifications_log (member_id, channel, template, payload, status, error, sent_at)
     values (nullif($1,'')::uuid, $2::notif_channel, 'custom', $3::jsonb, $4, $5,
             case when $4 in ('sent','simulated') then now() end)`,
    [
      memberId ?? "",
      channel,
      JSON.stringify({ to, subject: subject || null, message }),
      outcome.status,
      outcome.error ?? null,
    ]
  );

  revalidatePath("/admin/notifications");
  return { ok: outcome.ok, status: outcome.status, error: outcome.error };
}

const reminderSchema = z.object({
  channel: z.enum(["email", "whatsapp"]),
  template: z.enum(["fee_reminder", "renewal_thanks", "booking_confirmed", "welcome"]),
});

/**
 * Bulk fee reminders: notifies every active member whose subscription expires
 * within the next 7 days (or has already expired within the last 3).
 */
export async function sendExpiryReminders(input: unknown): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = reminderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const { sent } = await runExpiryReminders(parsed.data.channel);

  revalidatePath("/admin/notifications");
  return { ok: true, sent };
}

export async function getTemplatePreview(key: TemplateKey): Promise<string> {
  switch (key) {
    case "fee_reminder":
      return templates.fee_reminder("Rahul", "₹2,499", "31/07/2026");
    case "renewal_thanks":
      return templates.renewal_thanks("Rahul", "Pro", "31/08/2026");
    case "booking_confirmed":
      return templates.booking_confirmed("Rahul", "free trial", "Mon 6 PM");
    case "welcome":
      return templates.welcome("Rahul");
  }
}
