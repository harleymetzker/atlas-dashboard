-- ============================================================
-- ATLAS Financial Dashboard — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. ENTRIES TABLE
-- ---------------------------------------------------------------
create table if not exists public.entries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  type             text not null check (type in ('revenue', 'fixed_cost', 'variable_cost', 'withdrawal')),
  category         text not null,
  description      text default '',
  amount           numeric(14, 2) not null check (amount > 0),
  competence_date  date not null,   -- Data de Competência (usado no DRE)
  payment_date     date not null,   -- Data de Pagamento/Recebimento (usado no Fluxo de Caixa)
  created_at       timestamptz default now()
);

-- Indexes for fast per-user queries by each date type
create index if not exists entries_user_competence on public.entries (user_id, competence_date desc);
create index if not exists entries_user_payment    on public.entries (user_id, payment_date desc);
create index if not exists entries_user_type       on public.entries (user_id, type);

-- 2. ROW LEVEL SECURITY — users see ONLY their own data
-- ---------------------------------------------------------------
alter table public.entries enable row level security;

create policy "entries_select_own"
  on public.entries for select
  using (auth.uid() = user_id);

create policy "entries_insert_own"
  on public.entries for insert
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 3. OPENING BALANCES TABLE
-- ---------------------------------------------------------------
create table if not exists public.opening_balances (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  year_month  text not null,
  amount      numeric(14, 2) not null default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, year_month)
);

alter table public.opening_balances enable row level security;

create policy "ob_select_own"
  on public.opening_balances for select
  using (auth.uid() = user_id);

create policy "ob_insert_own"
  on public.opening_balances for insert
  with check (auth.uid() = user_id);

create policy "ob_update_own"
  on public.opening_balances for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- ADMIN EDGE FUNCTIONS (deploy via Supabase CLI)
-- See: supabase/functions/ directory
-- ============================================================
