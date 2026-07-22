-- 0004 — Members, subscriptions, payments, attendance

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  member_code text unique,
  full_name text not null,
  email text,
  phone text,
  gender text,
  dob date,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_notes text,
  photo_url text,
  status public.member_status not null default 'active',
  join_date date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_members_profile on public.members(profile_id);
create index if not exists idx_members_status on public.members(status);
create index if not exists idx_members_phone on public.members(phone);

drop trigger if exists trg_members_updated on public.members;
create trigger trg_members_updated before update on public.members
  for each row execute function public.set_updated_at();

-- Auto-generate a member_code like GX-000001 when not supplied.
create sequence if not exists public.member_code_seq start 1;
create or replace function public.set_member_code()
returns trigger
language plpgsql
as $$
begin
  if new.member_code is null then
    new.member_code := 'GX-' || lpad(nextval('public.member_code_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
drop trigger if exists trg_members_code on public.members;
create trigger trg_members_code before insert on public.members
  for each row execute function public.set_member_code();

create table if not exists public.member_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  plan_id uuid references public.membership_plans(id) on delete set null,
  term public.sub_term not null,
  start_date date not null default current_date,
  end_date date not null,
  amount numeric(10,2) not null default 0,
  status public.sub_status not null default 'active',
  created_at timestamptz not null default now()
);
create index if not exists idx_subs_member on public.member_subscriptions(member_id);
create index if not exists idx_subs_end on public.member_subscriptions(end_date);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  subscription_id uuid references public.member_subscriptions(id) on delete set null,
  amount numeric(10,2) not null,
  currency text not null default 'INR',
  method public.payment_method not null default 'cash',
  status public.payment_status not null default 'paid',
  invoice_no text unique,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  paid_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_member on public.payments(member_id);
create index if not exists idx_payments_created on public.payments(created_at);

-- Invoice number generator: INV-YYYY-000001
create sequence if not exists public.invoice_seq start 1;
create or replace function public.set_invoice_no()
returns trigger
language plpgsql
as $$
begin
  if new.invoice_no is null and new.status = 'paid' then
    new.invoice_no := 'INV-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.invoice_seq')::text, 6, '0');
  end if;
  if new.paid_at is null and new.status = 'paid' then
    new.paid_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists trg_payments_invoice on public.payments;
create trigger trg_payments_invoice before insert on public.payments
  for each row execute function public.set_invoice_no();

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  method public.attendance_method not null default 'manual',
  created_at timestamptz not null default now()
);
create index if not exists idx_attendance_member on public.attendance(member_id);
create index if not exists idx_attendance_checkin on public.attendance(check_in);
