import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/portal/profile-form";

export default async function PortalProfile() {
  const session = await getUserProfile();
  if (!session) redirect("/login?next=/portal/profile");
  const { profile } = session;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">Your profile</h1>
        <p className="mt-1 text-muted">Keep your contact details up to date.</p>
      </div>
      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <ProfileForm
          defaults={{
            fullName: profile.full_name ?? "",
            phone: profile.phone ?? "",
            email: profile.email ?? "",
          }}
        />
      </div>
    </div>
  );
}
