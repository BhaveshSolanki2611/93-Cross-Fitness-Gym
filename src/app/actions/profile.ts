"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { query } from "@/lib/db";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(15),
});

export async function updateProfile(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await getSupabaseServer();
  if (!supabase) return { ok: false, error: "Not configured" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // RLS "profiles self update" enforces ownership; role changes are blocked by trigger.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", user.id);
  if (error) return { ok: false, error: "Could not save. Please try again." };

  try {
    // Best-effort sync to members table
    await query(
      "UPDATE members SET full_name = $1, phone = $2 WHERE profile_id = $3",
      [parsed.data.fullName, parsed.data.phone, user.id]
    );
  } catch (err) {
    console.error("Failed to sync profile update to members table:", err);
  }

  revalidatePath("/portal/profile");
  return { ok: true };
}
