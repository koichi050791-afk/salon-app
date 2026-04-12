-- ============================================================
-- Salon App – Full Schema
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run (uses IF NOT EXISTS / DROP IF EXISTS).
-- ============================================================


-- ----------------------------------------------------------------
-- 1. stores
--    One row per physical salon location.
-- ----------------------------------------------------------------
create table if not exists stores (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

alter table stores enable row level security;

drop policy if exists "Authenticated users can read stores" on stores;
create policy "Authenticated users can read stores"
  on stores for select
  to authenticated
  using (true);

-- Seed data (skip if rows already exist)
insert into stores (name)
  select name from (values ('Downtown Salon'), ('Westside Salon')) as s(name)
  where not exists (select 1 from stores);


-- ----------------------------------------------------------------
-- 2. weekly_inputs
--    KPI numbers entered once per store per week.
--    Unique on (store_id, week) — upsert on conflict.
-- ----------------------------------------------------------------
create table if not exists weekly_inputs (
  id          uuid    primary key default gen_random_uuid(),
  store_id    uuid    not null references stores(id) on delete cascade,
  week        text    not null,          -- format: "2026-W15"
  revenue     numeric(12, 0) not null default 0,
  visitors    integer not null default 0,
  staff_count integer not null default 1,
  created_at  timestamptz default now(),

  unique (store_id, week)
);

alter table weekly_inputs enable row level security;

drop policy if exists "Authenticated users can manage weekly_inputs" on weekly_inputs;
create policy "Authenticated users can manage weekly_inputs"
  on weekly_inputs for all
  to authenticated
  using (true)
  with check (true);


-- ----------------------------------------------------------------
-- 3. weekly_tasks
--    Task text for each slot (position 1–3) per store per week.
--    Unique on (store_id, week, position).
-- ----------------------------------------------------------------
create table if not exists weekly_tasks (
  id         uuid    primary key default gen_random_uuid(),
  store_id   uuid    not null references stores(id) on delete cascade,
  week       text    not null,
  position   integer not null check (position between 1 and 3),
  text       text    not null default '',
  created_at timestamptz default now(),

  unique (store_id, week, position)
);

alter table weekly_tasks enable row level security;

drop policy if exists "Authenticated users can manage weekly_tasks" on weekly_tasks;
create policy "Authenticated users can manage weekly_tasks"
  on weekly_tasks for all
  to authenticated
  using (true)
  with check (true);


-- ----------------------------------------------------------------
-- 4. task_progress
--    Tracks whether each task slot is done.
--    One row per weekly_tasks row (unique on task_id).
-- ----------------------------------------------------------------
create table if not exists task_progress (
  id         uuid    primary key default gen_random_uuid(),
  task_id    uuid    not null references weekly_tasks(id) on delete cascade,
  done       boolean not null default false,
  updated_at timestamptz default now(),

  unique (task_id)
);

alter table task_progress enable row level security;

drop policy if exists "Authenticated users can manage task_progress" on task_progress;
create policy "Authenticated users can manage task_progress"
  on task_progress for all
  to authenticated
  using (true)
  with check (true);


-- ----------------------------------------------------------------
-- 5. weekly_staff_inputs
--    Individual stylist weekly performance numbers.
--    One row per (user, store, week_start_date).
-- ----------------------------------------------------------------
drop table if exists weekly_staff_inputs;

create table weekly_staff_inputs (
  id               uuid          primary key default gen_random_uuid(),
  store_id         uuid          not null references stores(id) on delete cascade,
  user_id          uuid          not null references auth.users(id) on delete cascade,
  week_start_date  date          not null,              -- Monday of the week
  sales            numeric(12,0) not null default 0,    -- 個人売上 (¥)
  clients          integer       not null default 0,    -- 担当客数 (人)
  working_hours    numeric(5,1)  not null default 0,    -- 労働時間 (h)
  created_at       timestamptz   default now(),

  unique (user_id, store_id, week_start_date)
);

alter table weekly_staff_inputs enable row level security;

drop policy if exists "Users can manage own staff inputs" on weekly_staff_inputs;
create policy "Users can manage own staff inputs"
  on weekly_staff_inputs for all
  to authenticated
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ----------------------------------------------------------------
-- weekly_tasks: fix unique constraint to support per-user tasks.
--
-- Before: UNIQUE (store_id, week, position)
--   → all 3 slots are shared across the whole store.
-- After: two partial indexes
--   → positions 1-3 for store-level tasks (user_id IS NULL)
--   → positions 1-3 per stylist (user_id IS NOT NULL)
-- ----------------------------------------------------------------
alter table weekly_tasks
  drop constraint if exists weekly_tasks_store_id_week_position_key;

drop index if exists weekly_tasks_store_unique;
create unique index weekly_tasks_store_unique
  on weekly_tasks (store_id, week, position)
  where user_id is null;

drop index if exists weekly_tasks_personal_unique;
create unique index weekly_tasks_personal_unique
  on weekly_tasks (store_id, user_id, week, position)
  where user_id is not null;
