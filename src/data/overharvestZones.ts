// [ARPAN] Illustrative overharvest / depletion sample data.
//
// What this is for: fake sample data standing in for satellite/NDVI
// monitoring, plotted on the admin dashboard's Leaflet map. NOT a real
// remote-sensing pipeline -- do not build one.
//
// Depends on: src/lib/types.ts -- OverharvestZone type.
//
// Must output/return: OVERHARVEST_ZONES, an array of OverharvestZone objects
// with plausible Indian forest-region names/coordinates and a depletion_score
// (0-100) spread across values so the map looks visually varied.
//
// TODO (Arpan):
// 1. Pick 6-10 real Indian forest/herb-growing region names with roughly correct lat/lon.
// 2. Assign each a depletion_score with a spread of values (some low, some high).
// 3. Any UI rendering this must show "Illustrative Sample Data -- Not Live Satellite Ingestion".
// 4. If this later moves into Supabase instead of a static file, mirror it into seed.sql (coordinate with Mansi).

import type { OverharvestZone } from "@/lib/types";

export const OVERHARVEST_ZONES: OverharvestZone[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    region: "Chamoli Alpine Belt, Uttarakhand",
    lat: 30.4124,
    lon: 79.3242,
    depletion_score: 78.5,
  },
  {
    id: "a2222222-2222-2222-2222-222222222222",
    region: "Satpura Forest Reserve, Madhya Pradesh",
    lat: 22.45,
    lon: 78.4333,
    depletion_score: 42.0,
  },
  {
    id: "a3333333-3333-3333-3333-333333333333",
    region: "Nilgiri Biosphere, Tamil Nadu",
    lat: 11.4102,
    lon: 76.695,
    depletion_score: 18.25,
  },
  {
    id: "a4444444-4444-4444-4444-444444444444",
    region: "Sehore Herbal Corridor, Madhya Pradesh",
    lat: 23.2031,
    lon: 77.0844,
    depletion_score: 64.0,
  },
  {
    id: "a5555555-5555-5555-5555-555555555555",
    region: "Wayanad Western Ghats, Kerala",
    lat: 11.6854,
    lon: 76.132,
    depletion_score: 88.0,
  },
  {
    id: "a6666666-6666-6666-6666-666666666666",
    region: "Aravali Foothills, Rajasthan",
    lat: 24.5854,
    lon: 73.7125,
    depletion_score: 31.5,
  },
];

