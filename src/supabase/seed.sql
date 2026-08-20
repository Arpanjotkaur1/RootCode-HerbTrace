-- RootCode / HerbTrace -- Supabase Seed Data
-- Run this in the Supabase SQL editor after schema.sql.
-- Populates demo harvesters and illustrative overharvest zones with real GPS coordinates.

-- 1. Demo Harvesters (Fixed UUIDs for consistent testing)
insert into harvesters (id, name, wallet_balance)
values
  ('11111111-1111-1111-1111-111111111111', 'Rajeshwar Gond (Sehore Belt)', 0.00),
  ('22222222-2222-2222-2222-222222222222', 'Sunita Devi (Chamoli Hills)', 0.00),
  ('33333333-3333-3333-3333-333333333333', 'Muthu Vel (Nilgiri Reserve)', 0.00),
  ('44444444-4444-4444-4444-444444444444', 'Anand Verma (Satpura Foothills)', 0.00)
on conflict (id) do nothing;

-- 2. Illustrative Overharvest / Depletion Zones
-- NOTE: Real numeric decimal GPS coordinates in Indian forest/herb harvesting regions.
-- Depletion score (0-100) is sample data for the admin map layer -- not live satellite NDVI.
insert into overharvest_zones (id, region, lat, lon, depletion_score)
values
  ('a1111111-1111-1111-1111-111111111111', 'Chamoli Alpine Belt, Uttarakhand', 30.4124, 79.3242, 78.50),
  ('a2222222-2222-2222-2222-222222222222', 'Satpura Forest Reserve, Madhya Pradesh', 22.4500, 78.4333, 42.00),
  ('a3333333-3333-3333-3333-333333333333', 'Nilgiri Biosphere, Tamil Nadu', 11.4102, 76.6950, 18.25),
  ('a4444444-4444-4444-4444-444444444444', 'Sehore Herbal Corridor, Madhya Pradesh', 23.2031, 77.0844, 64.00),
  ('a5555555-5555-5555-5555-555555555555', 'Wayanad Western Ghats, Kerala', 11.6854, 76.1320, 88.00),
  ('a6666666-6666-6666-6666-666666666666', 'Aravali Foothills, Rajasthan', 24.5854, 73.7125, 31.50)
on conflict (id) do nothing;

-- 3. Batches
-- Intentionally empty: batches must be submitted dynamically through POST /api/batches
-- so that SHA-256 hash chains and cryptographic commitments are created properly.

