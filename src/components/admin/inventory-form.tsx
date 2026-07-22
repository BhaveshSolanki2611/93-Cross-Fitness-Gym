"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/app/actions/erp";

const schema = z.object({
  name: z.string().min(2, "Enter item name").max(120),
  category: z.enum(["equipment", "supplement", "merchandise", "accessory"]),
  quantity: z
    .string()
    .min(1, "Qty")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Invalid"),
  status: z.enum(["ok", "maintenance_due", "under_repair", "retired"]),
  maintenanceDue: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function InventoryForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: "equipment", status: "ok", quantity: "1" },
  });

  async function onSubmit(values: Values) {
    setError(null);
    const res = await createInventoryItem({ ...values, quantity: Number(values.quantity) });
    if (res.ok) {
      reset({ category: values.category, status: "ok", quantity: "1", name: "", maintenanceDue: "", notes: "" });
      router.refresh();
    } else {
      setError(res.error ?? "Failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <label className="flex flex-col gap-1.5 lg:col-span-2">
        <span className="text-sm text-muted">Item</span>
        <input {...register("name")} className={inputCls} placeholder="e.g. Treadmill — Matrix T75" />
        {errors.name && <span className="text-xs text-ember">{errors.name.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Category</span>
        <select {...register("category")} className={inputCls}>
          <option value="equipment">Equipment</option>
          <option value="supplement">Supplement</option>
          <option value="merchandise">Merchandise</option>
          <option value="accessory">Accessory</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Qty</span>
        <input type="number" {...register("quantity")} className={inputCls} />
        {errors.quantity && <span className="text-xs text-ember">{errors.quantity.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Maintenance due</span>
        <input type="date" {...register("maintenanceDue")} className={inputCls} />
      </label>
      <div className="flex items-end">
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Add item"}
        </Button>
      </div>
      {error && <p className="text-sm text-ember sm:col-span-2 lg:col-span-6">{error}</p>}
    </form>
  );
}

const statusOptions = [
  { value: "ok", label: "OK" },
  { value: "maintenance_due", label: "Maintenance due" },
  { value: "under_repair", label: "Under repair" },
  { value: "retired", label: "Retired" },
] as const;

export function InventoryRowControls({
  id,
  status,
  quantity,
}: {
  id: string;
  status: string;
  quantity: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function patch(next: { status?: string; quantity?: number }) {
    setBusy(true);
    const res = await updateInventoryItem({ id, ...next });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Update failed");
  }

  async function onDelete() {
    if (!confirm("Delete this item?")) return;
    setBusy(true);
    const res = await deleteInventoryItem(id);
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Delete failed");
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="number"
        defaultValue={quantity}
        disabled={busy}
        onBlur={(e) => {
          const v = Number(e.target.value);
          if (Number.isInteger(v) && v >= 0 && v !== quantity) patch({ quantity: v });
        }}
        className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-right text-sm outline-none focus:border-primary disabled:opacity-50"
        aria-label="Quantity"
      />
      <select
        defaultValue={status}
        disabled={busy}
        onChange={(e) => patch({ status: e.target.value })}
        className="h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        aria-label="Status"
      >
        {statusOptions.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        onClick={onDelete}
        disabled={busy}
        aria-label="Delete item"
        className="rounded-full p-2 text-muted-2 transition-colors hover:bg-ember/10 hover:text-ember disabled:opacity-50"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      </button>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-primary";
