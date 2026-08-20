-- RootCode / HerbTrace -- Supabase schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query) after
-- creating the project. Mirrors src/lib/types.ts -- keep both in sync.

create extension if not exists "pgcrypto";

-- One row per harvester. wallet_balance is a simulated balance updated when a
-- batch passes QC (see api/qc/route.ts). No real money moves.
create table if not exists harvesters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  wallet_balance numeric(12, 2) not null default 0
);

-- One row per harvested batch. hash/prev_hash form the tamper-evident chain:
-- hash = SHA256(canonical_batch_data + prev_hash). See src/lib/hashChain.ts.
-- quantity_kg was added directly on the live table (not through this file) --
-- included here so schema.sql matches reality; POST /api/batches doesn't
-- currently set it, it just takes the column default.
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  species_claimed text not null,
  species_ai_result text not null,
  confidence_score numeric(5, 4) not null check (confidence_score >= 0 and confidence_score <= 1),
  gps_lat double precision not null,
  gps_lon double precision not null,
  harvester_id uuid not null references harvesters(id),
  photo_url text not null,
  "timestamp" timestamptz not null default now(),
  qc_status text not null default 'pending' check (qc_status in ('pending', 'pass', 'fail')),
  qc_notes text,
  qc_timestamp timestamptz,
  prev_hash text,
  hash text not null unique,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'released')),
  payment_amount numeric(12, 2),
  created_at timestamptz not null default now(),
  quantity_kg numeric(10, 2) not null default 0
);

create index if not exists batches_harvester_id_idx on batches (harvester_id);
create index if not exists batches_created_at_idx on batches (created_at);

-- Illustrative depletion-score sample data for the admin map layer.
-- NOT live satellite/NDVI ingestion -- see src/data/overharvestZones.ts and the
-- UI label requirement in the top-level README.
create table if not exists overharvest_zones (
  id uuid primary key default gen_random_uuid(),
  region text not null,
  lat double precision not null,
  lon double precision not null,
  depletion_score numeric(5, 2) not null check (depletion_score >= 0 and depletion_score <= 100)
);

-- RLS: enabled with permissive read policies for the demo. All writes go
-- through Next.js API routes using the service role key (server-side only),
-- which bypasses RLS, so no write policies are defined here.
alter table harvesters enable row level security;
alter table batches enable row level security;
alter table overharvest_zones enable row level security;

create policy "public read harvesters" on harvesters for select using (true);
create policy "public read batches" on batches for select using (true);
create policy "public read overharvest_zones" on overharvest_zones for select using (true);
