// [KHUSHI] Health / wake-up check.
//
// No DB call, no dependencies -- just confirms the process itself is
// awake. Useful for pinging the Render free-tier instance a few minutes
// before a live demo so the cold-start penalty (30-50s) doesn't happen in
// front of judges; a real request still needs the DB warm too, but this
// gets the process itself running first.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return NextResponse.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: CORS_HEADERS }
  );
}
