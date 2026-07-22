"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getUserProfile, isStaffRole } from "@/lib/supabase/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** ERP server actions: expenses + inventory. Staff-only; RLS enforces too. */

type Result = { ok: boolean; error?: string };

async function requireStaffAction() {
  const session = await getUserProfile();
  if (!session || !isStaffRole(session.profile.role)) return null;
  return session;
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
const expenseSchema = z.object({
  category: z.string().trim().min(2).max(60),
  amount: z.coerce.number().positive().max(1_00_00_000),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  spentOn: z.string().min(8),
});

export async function createExpense(input: unknown): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase.from("expenses").insert({
    category: parsed.data.category,
    amount: parsed.data.amount,
    description: parsed.data.description || null,
    spent_on: parsed.data.spentOn,
    created_by: session.user.id,
  });
  if (error) {
    console.error("createExpense:", error);
    return { ok: false, error: "Could not save expense." };
  }
  revalidatePath("/admin/expenses");
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid id" };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { ok: false, error: "Delete failed." };
  revalidatePath("/admin/expenses");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
const inventorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(["equipment", "supplement", "merchandise", "accessory"]),
  quantity: z.coerce.number().int().min(0).max(100000),
  status: z.enum(["ok", "maintenance_due", "under_repair", "retired"]),
  maintenanceDue: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function createInventoryItem(input: unknown): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = inventorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the form." };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase.from("inventory_items").insert({
    name: parsed.data.name,
    category: parsed.data.category,
    quantity: parsed.data.quantity,
    status: parsed.data.status,
    maintenance_due: parsed.data.maintenanceDue || null,
    notes: parsed.data.notes || null,
  });
  if (error) {
    console.error("createInventoryItem:", error);
    return { ok: false, error: "Could not save item." };
  }
  revalidatePath("/admin/inventory");
  return { ok: true };
}

const inventoryUpdateSchema = z.object({
  id: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(100000).optional(),
  status: z.enum(["ok", "maintenance_due", "under_repair", "retired"]).optional(),
});

export async function updateInventoryItem(input: unknown): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  const parsed = inventoryUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const patch: Record<string, unknown> = {};
  if (parsed.data.quantity !== undefined) patch.quantity = parsed.data.quantity;
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (Object.keys(patch).length === 0) return { ok: true };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase
    .from("inventory_items")
    .update(patch)
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: "Update failed." };
  revalidatePath("/admin/inventory");
  return { ok: true };
}

export async function deleteInventoryItem(id: string): Promise<Result> {
  const session = await requireStaffAction();
  if (!session) return { ok: false, error: "Not authorised" };
  if (!z.string().uuid().safeParse(id).success) return { ok: false, error: "Invalid id" };

  const supabase = (await getSupabaseServer())!;
  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) return { ok: false, error: "Delete failed." };
  revalidatePath("/admin/inventory");
  return { ok: true };
}
