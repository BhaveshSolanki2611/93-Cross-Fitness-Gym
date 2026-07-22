import { redirect } from "next/navigation";
import { getSupabaseServer, getUserProfile } from "@/lib/supabase/server";

function formatMethod(method: string) {
  if (method === "manual") return "Manual";
  if (method === "qr") return "QR Code";
  if (method === "barcode") return "Barcode";
  if (method === "rfid") return "RFID";
  if (!method) return "";
  return method.charAt(0).toUpperCase() + method.slice(1);
}

export default async function PortalAttendance() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal/attendance");
  const supabase = (await getSupabaseServer())!;

  const { data: members } = await supabase.from("members").select("id");
  const memberIds = (members ?? []).map((m) => m.id);

  const { data: rows } = memberIds.length
    ? await supabase
        .from("attendance")
        .select("check_in, check_out, method")
        .in("member_id", memberIds)
        .order("check_in", { ascending: false })
        .limit(60)
    : { data: [] };

  const list = rows ?? [];
  // simple current-month count
  const now = new Date();
  const thisMonth = list.filter((r) => {
    const d = new Date(r.check_in);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Attendance</h1>
        <p className="mt-1 text-muted">
          {thisMonth} visit{thisMonth === 1 ? "" : "s"} this month — keep the streak alive!
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        {list.length === 0 ? (
          <p className="text-sm text-muted">No check-ins recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((r, i) => {
              const inD = new Date(r.check_in);
              const outD = r.check_out ? new Date(r.check_out) : null;
              return (
                <li key={i} className="flex items-center justify-between py-3 text-sm">
                  <span>
                    {inD.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="text-muted">
                    {inD.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    {outD &&
                      ` → ${outD.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                    <span className="ml-3 rounded-full border border-border px-2 py-0.5 text-xs text-muted-2">
                      {formatMethod(r.method)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
