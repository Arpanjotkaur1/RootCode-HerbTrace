// [KHUSHI] Batch CRUD + hash-chain write.
// Critical path: blocks collection-center (Arpan), the admin ledger (Arpan),
// certificate generation (Mansi), and Saanvi's separate frontend repo.
//
// LOCKED CONTRACT (decided, do not re-litigate): POST body carries
// `photo_url` as a plain string, NOT image bytes. Saanvi's frontend uploads
// the photo directly to the public Supabase Storage bucket `harvest-photos`
// and sends the resulting public URL here.
//
// Called cross-origin by Saanvi's deployed frontend -- CORS headers below
// allow any origin since every response here is public, non-credentialed
// batch data (no cookies/auth), which keeps this simple for a 2-day build.

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServiceSupabase } from "@/lib/supabase";
import { computeBatchHash, type ChainableBatchData } from "@/lib/hashChain";

// Always run this on request, never at build time or from a static cache --
// every response here reflects live DB state (or needs live env vars that
// won't exist during `next build` without .env.local).
export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

// GET /api/batches            -> list all batches, oldest first
// GET /api/batches?id=...     -> single batch (for the provenance page)
// GET /api/batches?qc_status=pending&harvester_id=... -> filtered list
export async function GET(request: NextRequest) {
  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return json({ error: error.message }, { status: 500 });
    if (!data) return json({ error: "batch not found" }, { status: 404 });
    return json(data);
  }

  let query = supabase.from("batches").select("*").order("created_at", { ascending: true });

  const qcStatus = searchParams.get("qc_status");
  if (qcStatus) query = query.eq("qc_status", qcStatus);

  const harvesterId = searchParams.get("harvester_id");
  if (harvesterId) query = query.eq("harvester_id", harvesterId);

  const { data, error } = await query;
  if (error) return json({ error: error.message }, { status: 500 });
  return json(data);
}

type CreateBatchBody = {
  species_claimed: string;
  species_ai_result: string;
  confidence_score: number;
  gps_lat: number;
  gps_lon: number;
  harvester_id: string;
  photo_url: string;
  quantity_kg: number;
  timestamp?: string;
};

const REQUIRED_FIELDS: (keyof CreateBatchBody)[] = [
  "species_claimed",
  "species_ai_result",
  "confidence_score",
  "gps_lat",
  "gps_lon",
  "harvester_id",
  "photo_url",
  "quantity_kg",
];

// POST /api/batches -- harvester submits a confirmed capture.
// Chains onto the most recently created batch's hash, then inserts.
export async function POST(request: NextRequest) {
  let body: CreateBatchBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON body" }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ("" as unknown)
  );
  if (missing.length > 0) {
    return json({ error: `missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // NOTE: reading the latest hash then inserting is not race-safe under
  // concurrent submissions -- acceptable for a demo with one harvester
  // submitting at a time, but a real deployment would need a DB-level lock
  // or a Postgres function to make this atomic.
  const { data: previousBatch, error: prevError } = await supabase
    .from("batches")
    .select("hash")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prevError) {
    return json({ error: prevError.message }, { status: 500 });
  }

  const prevHash: string | null = previousBatch?.hash ?? null;
  const id = randomUUID();
  const timestamp = body.timestamp ?? new Date().toISOString();

  const chainable: ChainableBatchData = {
    id,
    species_claimed: body.species_claimed,
    species_ai_result: body.species_ai_result,
    confidence_score: body.confidence_score,
    gps_lat: body.gps_lat,
    gps_lon: body.gps_lon,
    harvester_id: body.harvester_id,
    photo_url: body.photo_url,
    timestamp,
  };

  const hash = computeBatchHash(chainable, prevHash);

  const { data: inserted, error: insertError } = await supabase
    .from("batches")
    .insert({
      id,
      species_claimed: chainable.species_claimed,
      species_ai_result: chainable.species_ai_result,
      confidence_score: chainable.confidence_score,
      gps_lat: chainable.gps_lat,
      gps_lon: chainable.gps_lon,
      harvester_id: chainable.harvester_id,
      photo_url: chainable.photo_url,
      timestamp,
      quantity_kg: body.quantity_kg,
      qc_status: "pending",
      prev_hash: prevHash,
      hash,
      payment_status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    return json({ error: insertError.message }, { status: 500 });
  }

  return json(inserted, { status: 201 });
}
