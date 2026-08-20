// [ARPAN] Helper functions the QC queue page calls.
//
// What this is for: talks to the batches/QC APIs on behalf of
// collection-center/page.tsx, so the page component doesn't hold fetch logic.
//
// Depends on:
// - GET /api/batches (Khushi, critical path) -- for fetchPendingBatches.
// - POST /api/qc (Arpan, this folder) -- for submitQcDecision.
// - src/lib/types.ts -- Batch type for shape.
//
// Must output/return:
// - fetchPendingBatches(): Promise<Batch[]> of batches with qc_status === "pending".
// - submitQcDecision(batchId, decision, notes): posts the decision to /api/qc.
//
// TODO (Arpan):
// 1. Implement fetchPendingBatches() against GET /api/batches?qc_status=pending.
// 2. Implement submitQcDecision() against POST /api/qc.
// 3. Handle and surface errors (network failure, batch already reviewed).

export async function fetchPendingBatches() {}

export async function submitQcDecision(
  batchId: string,
  decision: "pass" | "fail",
  notes: string
) {}
