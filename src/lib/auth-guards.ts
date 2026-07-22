import "server-only";
import { redirect } from "next/navigation";
import { getUserProfile, isStaffRole, isAdminRole, type AppRole } from "@/lib/supabase/server";

/**
 * Page-level guards. RLS remains the real enforcement layer — these give
 * clean redirects instead of empty queries.
 */
export async function requireStaff() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/admin");
  if (!isStaffRole(session.profile.role)) redirect("/portal");
  return session;
}

export async function requireAdmin() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/admin");
  if (!isAdminRole(session.profile.role)) redirect("/admin");
  return session;
}

export type { AppRole };
