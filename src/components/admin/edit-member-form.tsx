"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateMember } from "@/app/actions/admin";

const schema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2, "Enter the member's name").max(120),
  phone: z.string().min(10, "Enter a valid phone").max(15),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "frozen", "expired", "cancelled", "lead"]),
});

type Values = z.infer<typeof schema>;

export function EditMemberForm({
  member,
}: {
  member: {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    gender: string | null;
    status: "active" | "frozen" | "expired" | "cancelled" | "lead";
  };
}) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: member.id,
      fullName: member.full_name,
      phone: member.phone || "",
      email: member.email || "",
      gender: member.gender || "",
      status: member.status,
    },
  });

  async function onSubmit(values: Values) {
    setServerError(null);
    const res = await updateMember(values);
    if (res.ok) {
      router.refresh();
    } else {
      setServerError(res.error ?? "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputCls} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls} inputMode="tel" />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email (optional)" error={errors.email?.message}>
          <input {...register("email")} className={inputCls} />
        </Field>
        <Field label="Gender (optional)">
          <select {...register("gender")} className={inputCls}>
            <option value="">—</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select {...register("status")} className={inputCls}>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="lead">Lead</option>
          </select>
        </Field>
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-fit">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Updating…" : "Update member"}
      </Button>
      {serverError && <p className="text-sm text-ember">{serverError}</p>}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors focus:border-primary disabled:opacity-50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-muted">{label}</span>
      {children}
      {error && <span className="text-xs text-ember">{error}</span>}
    </label>
  );
}
