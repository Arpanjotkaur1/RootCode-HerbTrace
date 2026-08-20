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

export const OVERHARVEST_ZONES: OverharvestZone[] = [];
