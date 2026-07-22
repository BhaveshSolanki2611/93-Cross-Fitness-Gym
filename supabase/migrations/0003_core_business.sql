-- 0003 — Core business: branches, plans, trainers, classes, schedule

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  area text,
  city text,
  state text,
  postal_code text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  price_monthly numeric(10,2) not null default 0,
  price_quarterly numeric(10,2) not null default 0,
  price_yearly numeric(10,2) not null default 0,
  features jsonb not null default '[]'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  slug text unique not null,
  full_name text not null,
  role_title text,
  specialties text[] not null default '{}',
  certifications text[] not null default '{}',
  bio text,
  photo_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  service_slug text,
  default_capacity int not null default 20,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.class_schedule (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  trainer_id uuid references public.trainers(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  title text not null,
  service_slug text,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  capacity int not null default 20,
  intensity text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_class_schedule_day on public.class_schedule(day_of_week);
