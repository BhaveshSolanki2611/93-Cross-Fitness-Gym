"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer, getUserProfile, isStaffRole } from "@/lib/supabase/server";
import { notifyBookingConfirmed } from "@/lib/reminders";

/**
 * Staff server actions. Every action re-verifies the caller's role server-side
 * (defense in depth) and then acts through the RLS-scoped client, so Postgres
 * policies are the final authority.
 */

type ActionResult = { ok: boolean; error?: string; id?: string };

async function requireStaffAction() {
  const session = await getUserProfile();
  if (!session || !isStaffRole(session.profile.role)) return null;
  return session;
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------
const memberSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(15),
  email: z.string().trim().email().optional().or(z.literal("")),
  gender: z.string().trim().max(20).optional().or(z.literal("")),
  planSlug: z.string().trim().max(40).optional().or(z.literal("")),
  term: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  amount: z.coerce.number().min(0).max(10_00_000).optional(),
});

export async function createMember(input: unknown): Promise<ActionResult> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };

  const supabase = (await getSupabaseServer())!;
  const d = parsed.data;

  const { data: member, error } = await supabase
    .from("members")
    .insert({
      full_name: d.fullName,
      phone: d.phone,
      email: d.email || null,
      gender: d.gender || null,
      created_by: session.user.id,
    })
    .select("id")
    .single();
  if (error || !member) {
    console.error("createMember:", error);
    return { ok: false, error: "Could not create member." };
  }

  // Optional: attach a subscription + initial payment in one go.
  if (d.planSlug && d.term && d.amount != null) {
    const { data: plan } = await supabase
      .from("membership_plans")
      .select("id")
      .eq("slug", d.planSlug)
      .single();
    if (plan) {
      const months = d.term === "monthly" ? 1 : d.term === "quarterly" ? 3 : 12;
      const end = new Date();
      end.setMonth(end.getMonth() + months);
      const { data: sub } = await supabase
        .from("member_subscriptions")
        .insert({
          member_id: member.id,
          plan_id: plan.id,
          term: d.term,
          end_date: end.toISOString().slice(0, 10),
          amount: d.amount,
        })
        .select("id")
        .single();
      if (sub && d.amount > 0) {
        await supabase.from("payments").insert({
          member_id: member.id,
          subscription_id: sub.id,
          amount: d.amount,
          method: "cash",
          status: "paid",
          created_by: session.user.id,
        });
      }
    }
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  return { ok: true, id: member.id };
}

export async function checkInMember(memberId: string): Promise<ActionResult> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(memberId).success)
    return { ok: false, error: "Invalid member" };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase
    .from("attendance")
    .insert({ member_id: memberId, method: "manual" });
  if (error) return { ok: false, error: "Check-in failed." };

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  return { ok: true };
}

const updateMemberSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(10).max(15),
  email: z.string().trim().email().optional().or(z.literal("")),
  gender: z.string().trim().max(20).optional().or(z.literal("")),
  status: z.enum(["active", "frozen", "expired", "cancelled", "lead"]),
});

export async function updateMember(input: unknown): Promise<ActionResult> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = updateMemberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };

  const supabase = (await getSupabaseServer())!;
  const d = parsed.data;

  const { error } = await supabase
    .from("members")
    .update({
      full_name: d.fullName,
      phone: d.phone,
      email: d.email || null,
      gender: d.gender || null,
      status: d.status,
    })
    .eq("id", d.id);
  
  if (error) {
    console.error("updateMember:", error);
    return { ok: false, error: "Could not update member." };
  }

  revalidatePath("/admin/members");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------

// Payments
// ---------------------------------------------------------------------------
const paymentSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.coerce.number().positive().max(10_00_000),
  method: z.enum(["cash", "card", "upi", "razorpay", "bank", "other"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  planSlug: z.string().trim().max(40).optional().or(z.literal("")),
  term: z.enum(["monthly", "quarterly", "yearly"]).optional(),
});

export async function recordPayment(input: unknown): Promise<ActionResult> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };

  const supabase = (await getSupabaseServer())!;
  const d = parsed.data;
  let subscriptionId: string | undefined = undefined;

  if (d.planSlug && d.term) {
    const { data: plan } = await supabase
      .from("membership_plans")
      .select("id")
      .eq("slug", d.planSlug)
      .single();

    if (plan) {
      const { data: activeSubs } = await supabase
        .from("member_subscriptions")
        .select("end_date")
        .eq("member_id", d.memberId)
        .order("end_date", { ascending: false })
        .limit(1);

      let startDate = new Date();
      if (activeSubs && activeSubs.length > 0) {
        const lastEndDate = new Date(activeSubs[0].end_date);
        if (lastEndDate > startDate) {
          startDate = lastEndDate;
        }
      }

      const months = d.term === "monthly" ? 1 : d.term === "quarterly" ? 3 : 12;
      const end = new Date(startDate);
      end.setMonth(end.getMonth() + months);

      const { data: sub } = await supabase
        .from("member_subscriptions")
        .insert({
          member_id: d.memberId,
          plan_id: plan.id,
          term: d.term,
          end_date: end.toISOString().slice(0, 10),
          amount: d.amount,
        })
        .select("id")
        .single();

      if (sub) {
        subscriptionId = sub.id;
      }
    }
  }

  const { error } = await supabase.from("payments").insert({
    member_id: d.memberId,
    subscription_id: subscriptionId,
    amount: d.amount,
    method: d.method,
    status: "paid",
    notes: d.notes || null,
    created_by: session.user.id,
  });
  if (error) {
    console.error("recordPayment:", error);
    return { ok: false, error: "Could not record payment." };
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Bookings & Leads
// ---------------------------------------------------------------------------
export async function setBookingStatus(
  id: string,
  status: "confirmed" | "cancelled" | "completed"
): Promise<ActionResult> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid id" };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "Update failed." };

  // Best-effort confirmation message (WhatsApp/email); never blocks the update.
  if (status === "confirmed") {
    await notifyBookingConfirmed(id);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setLeadStatus(
  id: string,
  status: "new" | "contacted" | "trial_booked" | "converted" | "lost"
): Promise<ActionResult> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid id" };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, error: "Update failed." };

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}
