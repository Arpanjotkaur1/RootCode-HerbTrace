// [ARPAN] QC pass/fail + simulated payment release endpoint.
//
// What this is for: the collection-center worker's pass/fail decision lands
// here. On pass, it releases a simulated payment and updates the
// harvester's wallet balance.
//
// SIMULATION NOTICE: This is a prototype demonstration module. No real financial
// transactions or payment gateways are used; wallet balances and payment amounts
// are simulated ledger values within the database.
//
// Depends on:
// - src/app/api/batches/route.ts (Khushi, critical path) -- batches must exist.
// - src/lib/supabase.ts -- getServiceSupabase() for the writes.
// - src/lib/types.ts -- Batch, Harvester, QCStatus, PaymentStatus types.

import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import type { Batch, Harvester, QCStatus, PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Simulated rate (₹ per kg) for prototype demo calculations.
// This is NOT real commercial pricing.
const RATE_PER_KG = 50;

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

type QCRequestBody = {
  batchId?: string;
  batch_id?: string;
  decision?: QCStatus;
  notes?: string | null;
  qc_notes?: string | null;
  paymentAmount?: number | null;
  payment_amount?: number | null;
};

// POST /api/qc
// Body: { batchId: string, decision: "pass" | "fail", notes?: string, paymentAmount?: number }
export async function POST(request: NextRequest) {
  let body: QCRequestBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return json({ error: "request body must be a JSON object" }, { status: 400 });
  }

  const batchId = body.batchId || body.batch_id;
  const decision = body.decision;
  const rawNotes = body.notes !== undefined ? body.notes : body.qc_notes;
  const rawPaymentAmount =
    body.paymentAmount !== undefined ? body.paymentAmount : body.payment_amount;

  // 1. Validate required fields
  if (!batchId || typeof batchId !== "string" || batchId.trim() === "") {
    return json(
      { error: "missing or invalid required field: batchId" },
      { status: 400 }
    );
  }

  if (!decision || (decision !== "pass" && decision !== "fail")) {
    return json(
      { error: "missing or invalid required field: decision (must be 'pass' or 'fail')" },
      { status: 400 }
    );
  }

  if (rawNotes !== undefined && rawNotes !== null && typeof rawNotes !== "string") {
    return json(
      { error: "invalid field: notes must be a string if provided" },
      { status: 400 }
    );
  }

  if (
    rawPaymentAmount !== undefined &&
    rawPaymentAmount !== null &&
    (typeof rawPaymentAmount !== "number" || isNaN(rawPaymentAmount) || rawPaymentAmount < 0)
  ) {
    return json(
      { error: "invalid field: paymentAmount must be a non-negative number if provided" },
      { status: 400 }
    );
  }

  const normalizedBatchId = batchId.trim();
  const normalizedNotes =
    typeof rawNotes === "string" ? rawNotes.trim() : rawNotes === null ? null : undefined;

  const supabase = getServiceSupabase();

  // 2. Fetch existing batch
  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("*")
    .eq("id", normalizedBatchId)
    .maybeSingle();

  if (batchError) {
    return json({ error: `database error: ${batchError.message}` }, { status: 500 });
  }

  if (!batch) {
    return json(
      { error: `batch not found for ID: ${normalizedBatchId}` },
      { status: 404 }
    );
  }

  const qcTimestamp = new Date().toISOString();
  const qcNotes =
    normalizedNotes !== undefined ? normalizedNotes : (batch.qc_notes ?? null);

  // 3. Handle Decision "pass"
  if (decision === "pass") {
    // Resolve payment amount based on quantity_kg or request body override.
    // Resolution order:
    // 1. Explicit valid paymentAmount / payment_amount override from body.
    // 2. Calculated rate amount (quantity_kg * RATE_PER_KG).
    // 3. 0 if quantity_kg is missing or 0.
    const quantity = Number((batch as Record<string, unknown>).quantity_kg ?? 0);
    const calculatedAmount = Math.round(quantity * RATE_PER_KG * 100) / 100;

    const paymentAmount =
      typeof rawPaymentAmount === "number" && !isNaN(rawPaymentAmount)
        ? rawPaymentAmount
        : calculatedAmount;

    // Update batch row
    const { data: updatedBatch, error: updateBatchError } = await supabase
      .from("batches")
      .update({
        qc_status: "pass",
        qc_notes: qcNotes,
        qc_timestamp: qcTimestamp,
        payment_status: "released",
        payment_amount: paymentAmount,
      })
      .eq("id", batch.id)
      .select()
      .single();

    if (updateBatchError) {
      return json(
        { error: `failed to update batch: ${updateBatchError.message}` },
        { status: 500 }
      );
    }

    // Fetch matching harvester
    const { data: harvester, error: harvesterError } = await supabase
      .from("harvesters")
      .select("*")
      .eq("id", batch.harvester_id)
      .maybeSingle();

    if (harvesterError) {
      return json(
        { error: `failed to fetch harvester: ${harvesterError.message}` },
        { status: 500 }
      );
    }

    let updatedHarvester: Harvester | null = harvester;

    // Increment harvester wallet balance if harvester exists and payment hasn't already been released
    if (harvester) {
      const alreadyReleased = batch.payment_status === "released";
      if (!alreadyReleased && paymentAmount > 0) {
        const currentBalance = Number(harvester.wallet_balance) || 0;
        const newBalance = Number((currentBalance + paymentAmount).toFixed(2));

        const { data: updatedH, error: updateHarvesterError } = await supabase
          .from("harvesters")
          .update({ wallet_balance: newBalance })
          .eq("id", harvester.id)
          .select()
          .single();

        if (updateHarvesterError) {
          return json(
            {
              error: `failed to update harvester wallet balance: ${updateHarvesterError.message}`,
            },
            { status: 500 }
          );
        }
        updatedHarvester = updatedH;
      }
    }

    return json({
      batch: updatedBatch as Batch,
      harvester: updatedHarvester as Harvester | null,
    });
  }

  // 4. Handle Decision "fail"
  // Updates QC fields only; does NOT touch payment_status or wallet_balance.
  const { data: updatedBatch, error: updateBatchError } = await supabase
    .from("batches")
    .update({
      qc_status: "fail",
      qc_notes: qcNotes,
      qc_timestamp: qcTimestamp,
    })
    .eq("id", batch.id)
    .select()
    .single();

  if (updateBatchError) {
    return json(
      { error: `failed to update batch: ${updateBatchError.message}` },
      { status: 500 }
    );
  }

  // Fetch harvester for response context
  const { data: harvester } = await supabase
    .from("harvesters")
    .select("*")
    .eq("id", batch.harvester_id)
    .maybeSingle();

  return json({
    batch: updatedBatch as Batch,
    harvester: (harvester as Harvester) ?? null,
  });
}
