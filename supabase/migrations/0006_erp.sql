-- 0006 — Finance & ERP: expenses, inventory, audit log

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  category text not null,
  amount numeric(10,2) not null,
  description text,
  spent_on date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_expenses_date on public.expenses(spent_on);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete set null,
  name text not null,
  category public.inventory_category not null default 'equipment',
  quantity int not null default 0,
  unit text default 'unit',
  status text default 'ok',
  purchase_date date,
  maintenance_due date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_inventory_updated on public.inventory_items;
create trigger trg_inventory_updated before update on public.inventory_items
  for each row execute function public.set_updated_at();

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_created on public.audit_logs(created_at);
