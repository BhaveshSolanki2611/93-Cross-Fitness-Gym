import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server Supabase client — one per request, cookie-backed session (RLS applies).
 * Returns null when env isn't configured yet so pages can degrade gracefully.
 */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore when the
          // proxy (middleware) is refreshing sessions.
        }
      },
    },
  });
}

/** Current auth user, or null (also null when Supabase env isn't set). */
export async function getUser() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export type AppRole =
  | "super_admin"
  | "admin"
  | "manager"
  | "receptionist"
  | "trainer"
  | "nutritionist"
  | "accountant"
  | "member";

const STAFF_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "manager",
  "receptionist",
  "trainer",
  "nutritionist",
  "accountant",
];

/** User + profile (role) in one call. */
export async function getUserProfile() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, role")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  return { user, profile: profile as { id: string; full_name: string | null; email: string | null; phone: string | null; avatar_url: string | null; role: AppRole } };
}

export function isStaffRole(role: AppRole) {
  return STAFF_ROLES.includes(role);
}

export function isAdminRole(role: AppRole) {
  return role === "super_admin" || role === "admin";
}
