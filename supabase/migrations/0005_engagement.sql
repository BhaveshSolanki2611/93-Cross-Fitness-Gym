-- 0005 — Bookings, leads (CRM), CMS content, notifications

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  type public.booking_type not null default 'free_trial',
  name text not null,
  phone text not null,
  email text,
  plan_id uuid references public.membership_plans(id) on delete set null,
  class_schedule_id uuid references public.class_schedule(id) on delete set null,
  preferred_date date,
  status public.booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_created on public.bookings(created_at);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  interest text,
  message text,
  source text default 'website',
  status public.lead_status not null default 'new',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_leads_status on public.leads(status);

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.set_updated_at();

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  rating int not null default 5 check (rating between 1 and 5),
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  category text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  cover_url text,
  category text,
  author text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_blog_updated on public.blog_posts;
create trigger trg_blog_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table if not exists public.notifications_log (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  channel public.notif_channel not null,
  template text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
