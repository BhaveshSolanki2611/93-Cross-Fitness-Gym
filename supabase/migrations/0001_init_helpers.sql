-- 0001 — Extensions, enums, and helper functions
-- Idempotent where practical so it can be re-applied safely.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum (
    'super_admin','admin','manager','receptionist','trainer','nutritionist','accountant','member'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.member_status as enum ('active','frozen','expired','cancelled','lead');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sub_term as enum ('monthly','quarterly','yearly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sub_status as enum ('active','expired','cancelled','frozen');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('cash','card','upi','razorpay','bank','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('paid','pending','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_method as enum ('qr','barcode','manual','rfid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_type as enum (
    'membership','free_trial','personal_training','fitness_assessment',
    'nutrition_consultation','group_class','spa_appointment'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('pending','confirmed','cancelled','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('new','contacted','trial_booked','converted','lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.notif_channel as enum ('whatsapp','sms','email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inventory_category as enum ('equipment','supplement','merchandise','accessory');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
