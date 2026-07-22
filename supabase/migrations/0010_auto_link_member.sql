-- 0010 — Auto-link members to profiles by email (bidirectional)
-- When admin creates a member with an email that matches a profile, set profile_id.
-- When a new user signs up and a member with that email exists, link them.

-- Trigger 1: Auto-link member → profile on member insert/update.
create or replace function public.auto_link_member_to_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only act if profile_id is not already set and email is provided.
  if new.profile_id is null and new.email is not null and new.email <> '' then
    select id into new.profile_id
    from public.profiles
    where lower(email) = lower(new.email)
    limit 1;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_members_auto_link on public.members;
create trigger trg_members_auto_link
  before insert or update on public.members
  for each row execute function public.auto_link_member_to_profile();

-- Trigger 2: Auto-link profile → member on profile insert (user signup).
-- Updates any unlinked members whose email matches the new profile.
create or replace function public.auto_link_profile_to_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null and new.email <> '' then
    update public.members
    set profile_id = new.id
    where profile_id is null
      and lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_auto_link_member on public.profiles;
create trigger trg_profiles_auto_link_member
  after insert on public.profiles
  for each row execute function public.auto_link_profile_to_member();

-- Backfill: link any existing members whose email matches a profile.
update public.members m
set profile_id = p.id
from public.profiles p
where m.profile_id is null
  and m.email is not null
  and lower(m.email) = lower(p.email);
