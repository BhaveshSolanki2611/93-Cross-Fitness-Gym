import "server-only";

/**
 * Notification sender abstraction.
 *
 * Channels: email (Resend), whatsapp (Meta WhatsApp Cloud API).
 * Without provider keys in env, senders fall back to a console/log-only mode so
 * the app keeps working in dev — every attempt is recorded in notifications_log
 * either way, with its status ('sent' | 'simulated' | 'failed').
 *
 * Env (all optional):
 *   RESEND_API_KEY, NOTIFY_FROM_EMAIL
 *   WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 */

export type Channel = "email" | "whatsapp" | "sms";

export interface SendInput {
  channel: Channel;
  /** email address or E.164 phone, per channel */
  to: string;
  subject?: string;
  message: string;
}

export interface SendOutcome {
  ok: boolean;
  status: "sent" | "simulated" | "failed";
  providerId?: string;
  error?: string;
}

async function sendEmail(to: string, subject: string, message: string): Promise<SendOutcome> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM_EMAIL ?? "93 Cross Fitness <onboarding@resend.dev>";
  if (!key) {
    console.info(`[notify:email:SIMULATED] to=${to} subject="${subject}"`);
    return { ok: true, status: "simulated" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: message,
      }),
    });
    const body = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) return { ok: false, status: "failed", error: body.message ?? `HTTP ${res.status}` };
    return { ok: true, status: "sent", providerId: body.id };
  } catch (e) {
    return { ok: false, status: "failed", error: e instanceof Error ? e.message : "network error" };
  }
}

async function sendWhatsapp(to: string, message: string): Promise<SendOutcome> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) {
    console.info(`[notify:whatsapp:SIMULATED] to=${to} msg="${message.slice(0, 60)}…"`);
    return { ok: true, status: "simulated" };
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: message },
      }),
    });
    const body = (await res.json()) as {
      messages?: { id: string }[];
      error?: { message?: string };
    };
    if (!res.ok) return { ok: false, status: "failed", error: body.error?.message ?? `HTTP ${res.status}` };
    return { ok: true, status: "sent", providerId: body.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, status: "failed", error: e instanceof Error ? e.message : "network error" };
  }
}

export async function sendNotification(input: SendInput): Promise<SendOutcome> {
  switch (input.channel) {
    case "email":
      return sendEmail(input.to, input.subject ?? "93 Cross Fitness", input.message);
    case "whatsapp":
      return sendWhatsapp(input.to, input.message);
    case "sms":
      // SMS provider not configured — log-only. (Add MSG91/Twilio here later.)
      console.info(`[notify:sms:SIMULATED] to=${input.to}`);
      return { ok: true, status: "simulated" };
  }
}

/** Prebuilt message templates used by admin quick-sends. */
export const templates = {
  fee_reminder: (name: string, amount: string, dueDate: string) =>
    `Hi ${name}! Your 93 Cross Fitness membership fee of ${amount} is due on ${dueDate}. Please renew at the front desk or online to keep training without interruption. 💪`,
  renewal_thanks: (name: string, plan: string, validTill: string) =>
    `Thank you ${name}! Your ${plan} membership at 93 Cross Fitness is renewed and valid till ${validTill}. See you at the gym! 🏋️`,
  booking_confirmed: (name: string, what: string, when: string) =>
    `Hi ${name}, your ${what} at 93 Cross Fitness is confirmed for ${when}. Reply here or call 099903 00093 if you need to reschedule.`,
  welcome: (name: string) =>
    `Welcome to 93 Cross Fitness Gym & Spa, ${name}! 🎉 Your fitness journey starts now. Ask our front desk about your free fitness assessment.`,
} as const;

export type TemplateKey = keyof typeof templates;
