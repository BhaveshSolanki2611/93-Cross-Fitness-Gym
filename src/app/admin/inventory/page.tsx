import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { InventoryForm, InventoryRowControls } from "@/components/admin/inventory-form";

const statusTone: Record<string, string> = {
  ok: "bg-primary/10 text-primary",
  maintenance_due: "bg-ember/10 text-ember",
  under_repair: "bg-sky-400/10 text-sky-400",
  retired: "bg-surface-2 text-muted-2",
};

export default async function AdminInventory() {
  await requireStaff();

  const items = await query<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    status: string;
    maintenance_due: string | null;
    notes: string | null;
  }>(
    `select id, name, category::text, quantity, coalesce(status,'ok') as status,
            maintenance_due, notes
     from inventory_items
     order by (status = 'maintenance_due') desc, name asc limit 200`
  );

  // eslint-disable-next-line react-hooks/purity -- server component, Date.now() stable per request
  const now = Date.now();
  const dueSoon = items.filter(
    (i) =>
      i.maintenance_due &&
      new Date(i.maintenance_due).getTime() < now + 14 * 86_400_000
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Inventory</h1>
          <p className="mt-1 text-muted">
            Equipment, supplements and merchandise — with maintenance tracking.
          </p>
        </div>
        {dueSoon > 0 && (
          <div className="rounded-full bg-ember/10 px-4 py-2 text-sm font-semibold text-ember">
            {dueSoon} item{dueSoon === 1 ? "" : "s"} due maintenance within 14 days
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="mb-4 text-lg">Add item</h2>
        <InventoryForm />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Item</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Maintenance due</th>
              <th className="p-4 text-right">Qty / Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No inventory yet. Add your first item above.
                </td>
              </tr>
            )}
            {items.map((i) => (
              <tr key={i.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <div className="font-medium">{i.name}</div>
                  {i.notes && <div className="text-xs text-muted-2">{i.notes}</div>}
                </td>
                <td className="p-4 capitalize text-muted">{i.category}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusTone[i.status] ?? statusTone.ok}`}
                  >
                    {i.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-4 text-muted">
                  {i.maintenance_due
                    ? new Date(i.maintenance_due).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="p-4">
                  <InventoryRowControls id={i.id} status={i.status} quantity={i.quantity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
