// [ARPAN] QR generation for an approved batch.
//
// What this is for: produces a QR code encoding the URL to Saanvi's
// provenance page for a given batch, using the `qrcode` npm package.
//
// Depends on:
// - src/app/api/batches/route.ts (Khushi, critical path) -- to look up the batch.
// - api/qc/route.ts (Arpan, this folder) -- ideally only generate QR after QC passes.
// - The deployed frontend base URL (final live QR can only point at the real
//   deployed URL once Khushi deploys -- that's a final-day manual step, not
//   something to fake here with localhost).
//
// Must output/return: GET ?batchId=... returns a QR code (data URL or PNG)
// encoding {frontendBaseUrl}/provenance/{batchId}.

import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getServiceSupabase } from "@/lib/supabase";

// force-dynamic: not logic, just tells Next.js not to prerender this GET
// route at build time (it needs live DB reads and live env vars).
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

// GET /api/qr?batchId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId =
      searchParams.get("batchId") ||
      searchParams.get("id") ||
      searchParams.get("batch_id");

    if (!batchId || typeof batchId !== "string" || batchId.trim() === "") {
      return json(
        { error: "missing or invalid required field: batchId" },
        { status: 400 }
      );
    }

    const normalizedBatchId = batchId.trim();
    const supabase = getServiceSupabase();

    // 1. Look up batch
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("*")
      .eq("id", normalizedBatchId)
      .maybeSingle();

    if (batchError) {
      return json(
        { error: `database error: ${batchError.message}` },
        { status: 500 }
      );
    }

    if (!batch) {
      return json(
        { error: `batch not found for ID: ${normalizedBatchId}` },
        { status: 404 }
      );
    }

    // 2. QC status check: only generate QR if batch has passed QC
    if (batch.qc_status !== "pass") {
      return json(
        {
          error: `QR unavailable: batch has not passed QC (status: ${batch.qc_status})`,
        },
        { status: 400 }
      );
    }

    // 3. Resolve frontend base URL & provenance URL
    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL ||
      process.env.NEXT_PUBLIC_FRONTEND_URL ||
      "http://localhost:8080";
    const provenanceUrl = `${frontendBaseUrl}/provenance/${batch.id}`;

    // 3. Format determination: PNG binary vs base64 data URL
    const format = searchParams.get("format")?.toLowerCase();
    const acceptHeader = request.headers.get("accept") || "";

    if (format === "png" || acceptHeader.includes("image/png")) {
      const pngBuffer = await QRCode.toBuffer(provenanceUrl, {
        margin: 1,
        width: 300,
        color: {
          dark: "#1b4332",
          light: "#ffffff",
        },
      });

      return new NextResponse(new Uint8Array(pngBuffer), {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "image/png",
          "Content-Disposition": `inline; filename="HerbTrace-QR-${batch.id.slice(0, 8)}.png"`,
        },
      });
    }

    // Default: Return base64 PNG data URL in JSON
    const qrDataUrl = await QRCode.toDataURL(provenanceUrl, {
      margin: 1,
      width: 300,
      color: {
        dark: "#1b4332",
        light: "#ffffff",
      },
    });

    return json({
      qr: qrDataUrl,
      qr_data_url: qrDataUrl,
      provenance_url: provenanceUrl,
      batch_id: batch.id,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to generate QR code";
    return json({ error: message }, { status: 500 });
  }
}
