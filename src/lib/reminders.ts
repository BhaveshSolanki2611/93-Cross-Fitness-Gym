import "server-only";
import { query } from "@/lib/db";
import { sendNotification, templates, type Channel } from "@/lib/notify";

/**
 * Expiry-reminder core, shared by the admin "send now" action and the daily
 * cron route. Notifies every active member whose active subscription expires
 * within the next 7 days (or expired within the last 3), skipping anyone
 * already reminded in the last 3 days so the daily cron doesn't spam.
 */
export async function runExpiryReminders(
  channel: Extract<Channel, "email" | "whatsapp">
): Promise<{ sent: number; total: number }> {
  const due = await query<{
    member_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    end_date: string;
    amount: string;
  }>(
    `select m.id as member_id, m.full_name, m.email, m.phone, s.end_date, s.amount::text
     from members m
     join member_subscriptions s on s.member_id = m.id and s.status = 'active'
     where s.end_date between current_date - 3 and current_date + 7
       and m.status = 'active'
       and not exists (
         select 1 from notifications_log n
          where n.member_id = m.id
            and n.template = 'fee_reminder'
            and n.status in ('sent','simulated')
            and n.sent_at > now() - interval '3 days'
       )`
  );

  let sent = 0;
  for (const d of due) {
    const to = channel === "email" ? d.email : d.phone;
    if (!to) continue;
    const msg = templates.fee_reminder(
      d.full_name.split(" ")[0],
      `₹${Number(d.amount).toLocaleString("en-IN")}`,
      new Date(d.end_date).toLocaleDateString("en-IN")
    );
    const outcome = await sendNotification({
      channel,
      to,
      subject: "Membership renewal reminder — 93 Cross Fitness",
      message: msg,
    });
    await logNotification({
      memberId: d.member_id,
      channel,
      template: "fee_reminder",
      payload: { to, message: msg },
      status: outcome.status,
      error: outcome.error,
    });
    if (outcome.ok) sent++;
  }
  return { sent, total: due.length };
}

/** Insert a notifications_log row (single place for the insert SQL). */
export async function logNotification(input: {
  memberId?: string | null;
  channel: Channel;
  template: string;
  payload: Record<string, unknown>;
  status: string;
  error?: string | null;
}): Promise<void> {
  await query(
    `insert into notifications_log (member_id, channel, template, payload, status, error, sent_at)
     values (nullif($1,'')::uuid, $2::notif_channel, $3, $4::jsonb, $5, $6,
             case when $5 in ('sent','simulated') then now() end)`,
    [
      input.memberId ?? "",
      input.channel,
      input.template,
      JSON.stringify(input.payload),
      input.status,
      input.error ?? null,
    ]
  );
}

/**
 * Best-effort event notifications — never throw (a failed send must not break
 * the business action that triggered it). WhatsApp first when a phone exists,
 * email as the fallback channel.
 */
export async function notifyRenewalThanks(memberId: string): Promise<void> {
  try {
    const rows = await query<{
      full_name: string;
      email: string | null;
      phone: string | null;
      plan_name: string | null;
      end_date: string;
    }>(
      `select m.full_name, m.email, m.phone, p.name as plan_name, s.end_date
       from members m
       join member_subscriptions s on s.member_id = m.id and s.status = 'active'
       left join membership_plans p on p.id = s.plan_id
       where m.id = $1
       order by s.created_at desc
       limit 1`,
      [memberId]
    );
    const r = rows[0];
    if (!r) return;
    const msg = templates.renewal_thanks(
      r.full_name.split(" ")[0],
      r.plan_name ?? "membership",
      new Date(r.end_date).toLocaleDateString("en-IN")
    );
    const channel: Channel = r.phone ? "whatsapp" : "email";
    const to = r.phone ?? r.email;
    if (!to) return;
    const outcome = await sendNotification({
      channel,
      to,
      subject: "Membership renewed — 93 Cross Fitness",
      message: msg,
    });
    await logNotification({
      memberId,
      channel,
      template: "renewal_thanks",
      payload: { to, message: msg },
      status: outcome.status,
      error: outcome.error,
    });
  } catch (e) {
    console.error("notifyRenewalThanks:", e);
  }
}

export async function notifyBookingConfirmed(bookingId: string): Promise<void> {
  try {
    const rows = await query<{
      name: string;
      phone: string;
      email: string | null;
      type: string;
      preferred_date: string | null;
      member_id: string | null;
    }>(
      `select name, phone, email, type::text, preferred_date, member_id
       from bookings where id = $1`,
      [bookingId]
    );
    const b = rows[0];
    if (!b) return;
    const what = b.type.replaceAll("_", " ");
    const when = b.preferred_date
      ? new Date(b.preferred_date).toLocaleDateString("en-IN")
      : "your preferred time";
    const msg = templates.booking_confirmed(b.name.split(" ")[0], what, when);
    const channel: Channel = b.phone ? "whatsapp" : "email";
    const to = b.phone || b.email;
    if (!to) return;
    const outcome = await sendNotification({
      channel,
      to,
      subject: "Booking confirmed — 93 Cross Fitness",
      message: msg,
    });
    await logNotification({
      memberId: b.member_id,
      channel,
      template: "booking_confirmed",
      payload: { to, message: msg, booking_id: bookingId },
      status: outcome.status,
      error: outcome.error,
    });
  } catch (e) {
    console.error("notifyBookingConfirmed:", e);
  }
}
