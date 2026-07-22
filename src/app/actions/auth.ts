"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AuthResult = { ok: boolean; error?: string };

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2, "Please enter your name").max(120),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(15),
});

export async function signIn(input: unknown): Promise<AuthResult> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return {
      ok: false,
      error: "Authentication isn't configured yet (missing Supabase keys).",
    };
  }
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: "Invalid email or password." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUp(input: unknown): Promise<AuthResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return {
      ok: false,
      error: "Authentication isn't configured yet (missing Supabase keys).",
    };
  }
  const { email, password, fullName, phone } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseServer();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const parsed = z.string().email("Enter a valid email").safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return {
      ok: false,
      error: "Authentication isn't configured yet (missing Supabase keys).",
    };
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { 
    redirectTo: `${siteUrl}/login` 
  });
  
  if (error) {
    return { ok: false, error: error.message };
  }
  
  return { ok: true };
}
