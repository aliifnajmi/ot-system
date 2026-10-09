-- Mulia OT System V4 — Supabase/PostgreSQL schema
-- Run in Supabase SQL Editor on a NEW project before connecting the frontend.
-- Roles are only 'admin' and 'technician'. Do not put service_role/secret keys in browser code.

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'technician' check (role in ('admin','technician')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  full_name text not null,
  passport_ic text not null,
  phone text,
  company text not null,
  trade text not null,
  email text,
  profile_photo_url text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workers_passport_ic_not_blank check (length(trim(passport_ic)) > 0)
);

create table if not exists public.ot_records (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.workers(id) on delete restrict,
  ot_date date not null,
  start_time time not null,
  end_time time not null,
  hours numeric(5,2) not null check (hours > 0 and hours <= 24),
  location text not null,
  remarks text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ot_times_not_equal check (start_time <> end_time)
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workers_name_idx on public.workers using btree (full_name);
create index if not exists workers_status_idx on public.workers (status);
create index if not exists ot_records_date_idx on public.ot_records (ot_date desc);
create index if not exists ot_records_status_idx on public.ot_records (status);
create index if not exists ot_records_worker_date_idx on public.ot_records (worker_id, ot_date desc);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

alter table public.user_profiles enable row level security;
alter table public.workers enable row level security;
alter table public.ot_records enable row level security;
alter table public.audit_log enable row level security;

-- Profile: a signed-in user can read their own application profile.
drop policy if exists "users read own profile" on public.user_profiles;
create policy "users read own profile" on public.user_profiles
for select to authenticated using (id = auth.uid());

-- Only users provisioned with admin/technician role can use business data.
drop policy if exists "staff manage workers" on public.workers;
create policy "staff manage workers" on public.workers
for all to authenticated
using (public.current_app_role() in ('admin','technician'))
with check (public.current_app_role() in ('admin','technician'));

drop policy if exists "staff manage ot records" on public.ot_records;
create policy "staff manage ot records" on public.ot_records
for all to authenticated
using (public.current_app_role() in ('admin','technician'))
with check (public.current_app_role() in ('admin','technician'));

drop policy if exists "staff read audit log" on public.audit_log;
create policy "staff read audit log" on public.audit_log
for select to authenticated
using (public.current_app_role() in ('admin','technician'));

drop policy if exists "staff insert audit log" on public.audit_log;
create policy "staff insert audit log" on public.audit_log
for insert to authenticated
with check (public.current_app_role() in ('admin','technician'));

-- Never allow browser users to update their own role. Provision user_profiles.role
-- from the SQL editor or a trusted server-side admin workflow.
