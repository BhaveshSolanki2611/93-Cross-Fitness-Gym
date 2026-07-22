"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  sendSingleNotification,
  sendExpiryReminders,
} from "@/app/actions/notifications";

const schema = z.object({
  memberId: z.string().optional().or(z.literal("")),
  channel: z.enum(["email", "whatsapp", "sms"]),
  to: z.string().min(5, "Enter an email or phone"),
  subject: z.string().max(150).optional().or(z.literal("")),
  message: z.string().min(2, "Write a message").max(2000),
});

type Values = z.infer<typeof schema>;

export function NotificationComposer({
  members,
}: {
  members: { id: string; label: string; email: string | null; phone: string | null }[];
}) {
  const router = useRouter();
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { channel: "whatsapp" },
  });

  const channel = watch("channel");

  function onMemberPick(id: string) {
    setValue("memberId", id);
    const m = members.find((x) => x.id === id);
    if (!m) return;
    const target = channel === "email" ? m.email : m.phone;
    if (target) setValue("to", target);
  }

  async function onSubmit(values: Values) {
    setFeedback(null);
    setError(null);
    const res = await sendSingleNotification(values);
    if (res.ok) {
      setFeedback(
        res.status === "simulated"
          ? "Logged in simulate mode (no provider keys configured yet)."
          : "Notification sent!"
      );
      reset({ channel: values.channel, memberId: "", to: "", subject: "", message: "" });
      router.refresh();
    } else {
      setError(res.error ?? "Send failed.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Channel</span>
          <select {...register("channel")} className={inputCls}>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Member (optional)</span>
          <select
            {...register("memberId")}
            className={inputCls}
            onChange={(e) => onMemberPick(e.target.value)}
          >
            <option value="">Pick to autofill…</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">
            To ({channel === "email" ? "email address" : "phone number"})
          </span>
          <input {...register("to")} className={inputCls} placeholder={channel === "email" ? "member@email.com" : "+91XXXXXXXXXX"} />
          {errors.to && <span className="text-xs text-ember">{errors.to.message}</span>}
        </label>
      </div>
      {channel === "email" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-muted">Subject</span>
          <input {...register("subject")} className={inputCls} placeholder="Subject line" />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-muted">Message</span>
        <textarea
          {...register("message")}
          rows={4}
          className={inputCls + " h-auto py-3"}
          placeholder="Type your message…"
        />
        {errors.message && <span className="text-xs text-ember">{errors.message.message}</span>}
      </label>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Send
        </Button>
        {feedback && (
          <span className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="size-4" /> {feedback}
          </span>
        )}
        {error && <span className="text-sm text-ember">{error}</span>}
      </div>
    </form>
  );
}

export function BulkReminderButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  async function run(channel: "whatsapp" | "email") {
    setBusy(true);
    setResult(null);
    const res = await sendExpiryReminders({ channel, template: "fee_reminder" });
    setBusy(false);
    setResult(
      res.ok
        ? `Reminders queued for ${res.sent ?? 0} member(s) with plans expiring within 7 days.`
        : (res.error ?? "Failed.")
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => run("whatsapp")}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}
          WhatsApp reminders
        </button>
        <button
          onClick={() => run("email")}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <BellRing className="size-4" />}
          Email reminders
        </button>
      </div>
      {result && <p className="text-sm text-muted">{result}</p>}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background px-4 text-foreground outline-none transition-colors placeholder:text-muted-2 focus:border-primary";
