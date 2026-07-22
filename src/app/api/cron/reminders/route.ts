import { runExpiryReminders } from "@/lib/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily membership-expiry reminders. Invoked by Vercel Cron (see vercel.json);
 * Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically when the
 * CRON_SECRET env var is set. Can also be triggered manually with the secret:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/reminders
 *
 * Sends on WhatsApp when the member has a phone; falls back to email for the
 * rest. Members reminded in the last 3 days are skipped (see runExpiryReminders).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const whatsapp = await runExpiryReminders("whatsapp");
    const email = await runExpiryReminders("email");
    return Response.json({ ok: true, whatsapp, email });
  } catch (e) {
    console.error("cron/reminders:", e);
    return Response.json({ error: "Reminder run failed." }, { status: 500 });
  }
}
