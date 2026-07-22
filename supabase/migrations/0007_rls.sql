-- 0007 — Row Level Security. Enable RLS on every public table and add policies
-- matched to the real access model. Enforcement is row-level; grants below open
-- the tables to the Data API roles, RLS decides which rows are visible.

-- Helper: the member ids owned by the current auth user (SECURITY DEFINER to
-- avoid RLS recursion; only returns the caller's own members).
create or replace function public.my_member_ids()
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.members where profile_id = (select auth.uid());
$$;
revoke all on function public.my_member_ids() from public;
grant execute on function public.my_member_ids() to authenticated;

-- Prevent non-admins from escalating their own role. Direct SQL / service_role
-- (no auth context) is trusted and bypasses the guard.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','branches','membership_plans','trainers','classes','class_schedule',
    'members','member_subscriptions','payments','attendance','bookings','leads',
    'testimonials','gallery_images','blog_posts','notifications_log','expenses',
    'inventory_items','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Grants (RLS still governs rows). anon = public site, authenticated = users.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

-- Public-readable content
grant select on public.branches, public.membership_plans, public.trainers,
  public.classes, public.class_schedule, public.testimonials,
  public.gallery_images, public.blog_posts to anon, authenticated;

-- Website forms (anon may insert only)
grant insert on public.leads, public.bookings to anon, authenticated;

-- Authenticated app tables (members + staff); RLS restricts rows
grant select, insert, update, delete on
  public.profiles, public.members, public.member_subscriptions, public.payments,
  public.attendance, public.bookings, public.leads, public.branches,
  public.membership_plans, public.trainers, public.classes, public.class_schedule,
  public.testimonials, public.gallery_images, public.blog_posts,
  public.notifications_log, public.expenses, public.inventory_items,
  public.audit_logs to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

-- profiles ---------------------------------------------------------------
create policy "profiles self or admin read" on public.profiles for select
  to authenticated using ((select auth.uid()) = id or public.is_admin());
create policy "profiles self update" on public.profiles for update
  to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy "profiles admin all" on public.profiles for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

-- Public content: readable when published/active, or by staff. Staff manage.
-- branches
create policy "branches public read" on public.branches for select
  to anon, authenticated using (is_active or public.is_staff());
create policy "branches staff manage" on public.branches for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
-- membership_plans
create policy "plans public read" on public.membership_plans for select
  to anon, authenticated using (is_active or public.is_staff());
create policy "plans staff manage" on public.membership_plans for all
  to authenticated using (public.is_admin()) with check (public.is_admin());
-- trainers
create policy "trainers public read" on public.trainers for select
  to anon, authenticated using (is_active or public.is_staff());
create policy "trainers staff manage" on public.trainers for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
-- classes
create policy "classes public read" on public.classes for select
  to anon, authenticated using (is_active or public.is_staff());
create policy "classes staff manage" on public.classes for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
-- class_schedule
create policy "schedule public read" on public.class_schedule for select
  to anon, authenticated using (is_active or public.is_staff());
create policy "schedule staff manage" on public.class_schedule for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
-- testimonials
create policy "testimonials public read" on public.testimonials for select
  to anon, authenticated using (is_published or public.is_staff());
create policy "testimonials staff manage" on public.testimonials for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
-- gallery_images
create policy "gallery public read" on public.gallery_images for select
  to anon, authenticated using (is_published or public.is_staff());
create policy "gallery staff manage" on public.gallery_images for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
-- blog_posts
create policy "blog public read" on public.blog_posts for select
  to anon, authenticated using (is_published or public.is_staff());
create policy "blog staff manage" on public.blog_posts for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- members ----------------------------------------------------------------
create policy "members self read" on public.members for select
  to authenticated using (profile_id = (select auth.uid()) or public.is_staff());
create policy "members staff manage" on public.members for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- subscriptions / payments / attendance: member sees own, staff manage
create policy "subs self read" on public.member_subscriptions for select
  to authenticated using (member_id in (select public.my_member_ids()) or public.is_staff());
create policy "subs staff manage" on public.member_subscriptions for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "payments self read" on public.payments for select
  to authenticated using (member_id in (select public.my_member_ids()) or public.is_staff());
create policy "payments staff manage" on public.payments for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "attendance self read" on public.attendance for select
  to authenticated using (member_id in (select public.my_member_ids()) or public.is_staff());
create policy "attendance staff manage" on public.attendance for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- bookings: anyone can create (website); member sees own; staff manage
create policy "bookings public insert" on public.bookings for insert
  to anon, authenticated with check (true);
create policy "bookings self read" on public.bookings for select
  to authenticated using (member_id in (select public.my_member_ids()) or public.is_staff());
create policy "bookings staff manage" on public.bookings for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- leads: anyone can create (website); only staff read/manage
create policy "leads public insert" on public.leads for insert
  to anon, authenticated with check (true);
create policy "leads staff manage" on public.leads for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- staff-only operational tables
create policy "notifications staff" on public.notifications_log for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "expenses staff" on public.expenses for all
  to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "inventory staff" on public.inventory_items for all
  to authenticated using (public.is_staff()) with check (public.is_staff());

-- audit logs: any staff can write, only admins can read
create policy "audit staff insert" on public.audit_logs for insert
  to authenticated with check (public.is_staff());
create policy "audit admin read" on public.audit_logs for select
  to authenticated using (public.is_admin());
