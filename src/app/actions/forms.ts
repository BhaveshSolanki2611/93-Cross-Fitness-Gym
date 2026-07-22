"use server";

import { z } from "zod";
import { query } from "@/lib/db";

/**
 * Server actions for public website forms. Validation happens here (server)
 * in addition to the client — never trust the client payload.
 */

const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(15),
  email: z.string().trim().email().optional().or(z.literal("")),
  interest: z.string().trim().max(120),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type FormResult = { ok: boolean; error?: string };

export async function submitLead(input: unknown): Promise<FormResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }
  const { name, phone, email, interest, message } = parsed.data;
  try {
    await query(
      `insert into leads (name, phone, email, interest, message, source)
       values ($1, $2, nullif($3, ''), $4, nullif($5, ''), 'website')`,
      [name, phone, email ?? "", interest, message ?? ""]
    );
    return { ok: true };
  } catch (e) {
    console.error("submitLead failed:", e);
    return { ok: false, error: "Something went wrong. Please try WhatsApp or call us." };
  }
}

const bookingTypeMap: Record<string, string> = {
  "Gym membership": "membership",
  "Free trial": "free_trial",
  "Personal trainer": "personal_training",
  "Fitness assessment": "fitness_assessment",
  "Nutrition consultation": "nutrition_consultation",
  "Group class": "group_class",
  "Spa appointment": "spa_appointment",
};

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(15),
  email: z.string().trim().email().optional().or(z.literal("")),
  type: z.string().refine((t) => t in bookingTypeMap, "Invalid booking type"),
  plan: z.string().trim().max(40).optional().or(z.literal("")),
  preferredDate: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function submitBooking(input: unknown): Promise<FormResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }
  const { name, phone, email, type, plan, preferredDate, notes } = parsed.data;
  try {
    await query(
      `insert into bookings (name, phone, email, type, plan_id, preferred_date, notes)
       values (
         $1, $2, nullif($3, ''), $4::booking_type,
         (select id from membership_plans where slug = nullif($5, '') limit 1),
         nullif($6, '')::date, nullif($7, '')
       )`,
      [name, phone, email ?? "", bookingTypeMap[type], plan ?? "", preferredDate ?? "", notes ?? ""]
    );
    return { ok: true };
  } catch (e) {
    console.error("submitBooking failed:", e);
    return { ok: false, error: "Something went wrong. Please try WhatsApp or call us." };
  }
}
