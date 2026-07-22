"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/actions/profile";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your name").max(120),
  phone: z.string().min(10, "Enter a valid phone number").max(15),
});

type Values = z.infer<typeof schema>;

export function ProfileForm({
  defaults,
}: {
  defaults: { fullName: string; phone: string; email: string };
}) {
  const [saved, setSaved] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: defaults.fullName, phone: defaults.phone },
  });

  async function onSubmit(values: Values) {
    setSaved(false);
    setServerError(null);
    const res = await updateProfile(values);
    if (res.ok) setSaved(true);
    else setServerError(res.error ?? "Something went wrong.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Email (login)</span>
        <input value={defaults.email} disabled className={inputCls + " opacity-60"} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Full name</span>
        <input {...register("fullName")} className={inputCls} />
        {errors.fullName && <span className="text-xs text-ember">{errors.fullName.message}</span>}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Phone</span>
        <input {...register("phone")} className={inputCls} inputMode="tel" />
        {errors.phone && <span className="text-xs text-ember">{errors.phone.message}</span>}
      </label>
      <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
        {isSubmitting ? "Saving…" : saved ? "Saved" : "Save changes"}
      </Button>
      {serverError && <p className="text-sm text-ember">{serverError}</p>}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors focus:border-primary";
