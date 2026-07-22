"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createExpense, deleteExpense } from "@/app/actions/erp";

const categories = [
  "Rent",
  "Salaries",
  "Electricity",
  "Equipment",
  "Maintenance",
  "Marketing",
  "Supplements stock",
  "Housekeeping",
  "Miscellaneous",
];

const schema = z.object({
  category: z.string().min(2, "Pick a category"),
  amount: z
    .string()
    .min(1, "Enter amount")
    .refine((v) => Number(v) > 0, "Enter a valid amount"),
  description: z.string().max(500).optional().or(z.literal("")),
  spentOn: z.string().min(8, "Pick a date"),
});

type Values = z.infer<typeof schema>;

export function ExpenseForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: categories[0] },
  });

  async function onSubmit(values: Values) {
    setError(null);
    const res = await createExpense({ ...values, amount: Number(values.amount) });
    if (res.ok) {
      reset({ category: values.category, amount: "", description: "", spentOn: values.spentOn });
      router.refresh();
    } else {
      setError(res.error ?? "Failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Category</span>
        <select {...register("category")} className={inputCls}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Amount (₹)</span>
        <input type="number" {...register("amount")} className={inputCls} />
        {errors.amount && <span className="text-xs text-ember">{errors.amount.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Date</span>
        <input type="date" {...register("spentOn")} className={inputCls} />
        {errors.spentOn && <span className="text-xs text-ember">{errors.spentOn.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Note (optional)</span>
        <input {...register("description")} className={inputCls} placeholder="e.g. AC repair" />
      </label>
      <div className="flex items-end">
        <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Add expense"}
        </Button>
      </div>
      {error && <p className="text-sm text-ember sm:col-span-2 lg:col-span-5">{error}</p>}
    </form>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  async function onDelete() {
    if (!confirm("Delete this expense?")) return;
    setBusy(true);
    const res = await deleteExpense(id);
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(res.error ?? "Delete failed");
  }
  return (
    <button
      onClick={onDelete}
      disabled={busy}
      aria-label="Delete expense"
      className="rounded-full p-2 text-muted-2 transition-colors hover:bg-ember/10 hover:text-ember disabled:opacity-50"
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </button>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors focus:border-primary";
