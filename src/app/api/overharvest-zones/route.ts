// [KHUSHI] Overharvest / depletion zone data -- illustrative sample data,
// NOT live satellite/NDVI ingestion.
//
// Source of truth is the `overharvest_zones` table (src/supabase/schema.sql),
// same pattern as api/batches/route.ts: this backend owns the data, Arpan's
// frontend repo fetches it over this endpoint rather than importing a static
// TS file directly. Any client rendering this data must show "Illustrative
// Sample Data -- Not Live Satellite Ingestion" near the map.
//
// Called cross-origin by Arpan's/Saanvi's deployed frontends -- same public,
// non-credentialed CORS posture as api/batches/route.ts.

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// GET /api/overharvest-zones -> all zones, for the admin map layer.
export async function GET() {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("overharvest_zones")
    .select("*")
    .order("region", { ascending: true });

  if (error) return json({ error: error.message }, { status: 500 });
  return json(data);
}
