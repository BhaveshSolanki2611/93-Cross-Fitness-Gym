import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth-guards";
import { NewMemberForm } from "@/components/admin/new-member-form";

export default async function NewMemberPage() {
  await requireStaff();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/members"
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to members
        </Link>
        <h1 className="text-3xl">Add member</h1>
        <p className="mt-1 text-muted">
          Register a new member, optionally with their first subscription and payment.
        </p>
      </div>
      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <NewMemberForm />
      </div>
    </div>
  );
}
