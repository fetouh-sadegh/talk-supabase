-- Challenge full setup (tables + RPC + settings)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Challenge codes
create table if not exists public.giveaway_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  claimed boolean not null default false,
  claimed_at timestamptz,
  claimed_by_name text,
  claimed_by_whatsapp text,
  claim_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_giveaway_codes_claimed_created_at
  on public.giveaway_codes (claimed, created_at);

create unique index if not exists idx_giveaway_codes_claimed_whatsapp_unique
  on public.giveaway_codes (lower(claimed_by_whatsapp))
  where claimed = true and claimed_by_whatsapp is not null;

drop trigger if exists trg_giveaway_codes_touch_updated_at on public.giveaway_codes;
create trigger trg_giveaway_codes_touch_updated_at
before update on public.giveaway_codes
for each row
execute function public.touch_updated_at();

-- App settings (single-row)
create table if not exists public.app_settings (
  id boolean primary key default true check (id = true),
  is_challenge_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, is_challenge_enabled)
values (true, true)
on conflict (id) do nothing;

drop trigger if exists trg_app_settings_touch_updated_at on public.app_settings;
create trigger trg_app_settings_touch_updated_at
before update on public.app_settings
for each row
execute function public.touch_updated_at();

-- Claim RPC
create or replace function public.claim_giveaway_code(
  participant text,
  whatsapp text
)
returns table (
  claim_id uuid,
  code text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
  v_claim_id uuid := gen_random_uuid();
  v_participant text := trim(participant);
  v_whatsapp text := trim(whatsapp);
  v_enabled boolean;
begin
  select is_challenge_enabled into v_enabled
  from public.app_settings
  where id = true;

  if coalesce(v_enabled, true) = false then
    raise exception 'Challenge is disabled.';
  end if;

  if coalesce(v_participant, '') = '' then
    raise exception 'participant is required';
  end if;

  if coalesce(v_whatsapp, '') = '' then
    raise exception 'whatsapp is required';
  end if;

  if exists (
    select 1
    from public.giveaway_codes
    where claimed = true
      and lower(claimed_by_whatsapp) = lower(v_whatsapp)
  ) then
    raise exception 'this whatsapp already claimed a code';
  end if;

  select g.id, g.code
    into v_id, v_code
  from public.giveaway_codes g
  where g.claimed = false
  order by g.created_at asc, g.code asc
  for update skip locked
  limit 1;

  if v_id is null then
    raise exception 'no codes remaining';
  end if;

  update public.giveaway_codes
  set
    claimed = true,
    claimed_at = now(),
    claimed_by_name = v_participant,
    claimed_by_whatsapp = v_whatsapp,
    claim_id = v_claim_id
  where id = v_id and claimed = false;

  if not found then
    raise exception 'claim conflict, please retry';
  end if;

  return query
  select v_claim_id, v_code;
end;
$$;

create or replace function public.get_codes_remaining()
returns table (
  remaining bigint,
  total bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*) filter (where claimed = false) as remaining,
    count(*) as total
  from public.giveaway_codes;
$$;

create or replace function public.select_available_code()
returns table (
  code text
)
language sql
security definer
set search_path = public
as $$
  select g.code
  from public.giveaway_codes g
  where g.claimed = false
  order by g.created_at asc, g.code asc
  limit 1;
$$;

create or replace function public.get_claimed_codes()
returns table (
  claimed_by_name text,
  claimed_by_whatsapp text,
  claimed_at timestamptz,
  code text
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(g.claimed_by_name, '') as claimed_by_name,
    coalesce(g.claimed_by_whatsapp, '') as claimed_by_whatsapp,
    g.claimed_at,
    g.code
  from public.giveaway_codes g
  where g.claimed = true
  order by g.claimed_at desc nulls last, g.created_at desc;
$$;

create or replace function public.get_challenge_settings()
returns table (
  is_challenge_enabled boolean
)
language sql
security definer
set search_path = public
as $$
  select coalesce(s.is_challenge_enabled, true) as is_challenge_enabled
  from public.app_settings s
  where s.id = true;
$$;

revoke all on public.giveaway_codes from anon, authenticated;
revoke all on public.app_settings from anon, authenticated;

grant execute on function public.claim_giveaway_code(text, text) to anon, authenticated;
grant execute on function public.get_codes_remaining() to anon, authenticated;
grant execute on function public.select_available_code() to anon, authenticated;
grant execute on function public.get_claimed_codes() to anon, authenticated;
grant execute on function public.get_challenge_settings() to anon, authenticated;

-- Seed sample codes (idempotent)
insert into public.giveaway_codes (code)
values
  ('CODE_1'),
  ('CODE_2')
on conflict (code) do nothing;
