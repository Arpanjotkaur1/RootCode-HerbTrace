// [KHUSHI] Harvester list -- id, name, wallet_balance.
//
// Source of truth is the `harvesters` table (src/supabase/schema.sql), same
// pattern as api/batches and api/overharvest-zones: this backend owns the
// data, frontend repos fetch it over this endpoint. Built for Saanvi's
// dataProvider.getWallets() call, which had nothing real to hit before this.
//
// Called cross-origin by Saanvi's/Arpan's deployed frontends -- same public,
// non-credentialed CORS posture as the other GET routes.

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

// GET /api/harvesters -> all harvesters, for wallet display.
export async function GET() {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("harvesters")
    .select("*")
    .order("name", { ascending: true });

  if (error) return json({ error: error.message }, { status: 500 });
  return json(data);
}
