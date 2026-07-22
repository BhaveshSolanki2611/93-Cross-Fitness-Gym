import { requireStaff } from "@/lib/auth-guards";
import { query } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { ExpenseForm, DeleteExpenseButton } from "@/components/admin/expense-form";

export default async function AdminExpenses() {
  await requireStaff();

  const [expenses, totals] = await Promise.all([
    query<{
      id: string;
      category: string;
      amount: string;
      description: string | null;
      spent_on: string;
    }>(
      `select id, category, amount::text, description, spent_on
       from expenses order by spent_on desc, created_at desc limit 100`
    ),
    query<{ month: string | null; by_category: string | null }>(
      `select
        (select sum(amount) from expenses
          where date_trunc('month', spent_on) = date_trunc('month', now()))::text as month,
        (select string_agg(category || ': ₹' || total, ' · ')
         from (
           select category, sum(amount)::bigint as total from expenses
           where date_trunc('month', spent_on) = date_trunc('month', now())
           group by category order by sum(amount) desc limit 4
         ) t)::text as by_category`
    ),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Expenses</h1>
          <p className="mt-1 text-muted">Track operating costs against revenue.</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-muted-2">This month</div>
          <div className="font-display text-2xl text-ember">
            {formatINR(Number(totals[0]?.month ?? 0))}
          </div>
          {totals[0]?.by_category && (
            <div className="mt-1 max-w-xs text-xs text-muted-2">{totals[0].by_category}</div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface/60 p-6">
        <h2 className="mb-4 text-lg">Add expense</h2>
        <ExpenseForm />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-surface/60">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-2">
              <th className="p-4">Date</th>
              <th className="p-4">Category</th>
              <th className="p-4">Note</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No expenses recorded yet.
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="p-4 text-muted">
                  {new Date(e.spent_on).toLocaleDateString("en-IN")}
                </td>
                <td className="p-4">{e.category}</td>
                <td className="p-4 text-muted">{e.description ?? "—"}</td>
                <td className="p-4 text-right font-semibold">{formatINR(Number(e.amount))}</td>
                <td className="p-4 text-right">
                  <DeleteExpenseButton id={e.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
