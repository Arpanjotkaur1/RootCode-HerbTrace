// [ARPAN] Collection Center QC queue page.
//
// What this is for: the screen a collection-center worker uses to review
// pending batches and pass/fail them. See README.md in this folder for the
// full step-by-step flow.
//
// Depends on:
// - GET /api/batches (Khushi, critical path) -- to list pending batches.
// - src/lib/types.ts -- Batch type for shape.
// - src/components/ui/* (Saanvi's separate frontend handles the polished UI;
//   this repo's admin/collection-center screens are internal-only and can
//   use plain Tailwind, no need to match her design system exactly).
//
// Must output/return: renders the pending queue + a pass/fail action per
// batch that calls actions.ts -> POST /api/qc.
//
// TODO (Arpan):
// 1. Fetch pending batches (qc_status === "pending") and render as a list.
// 2. Build a detail/inspect view per batch (photo, species, GPS, confidence).
// 3. Build the pass/fail control with an optional notes field.
// 4. Call submitQcDecision() from actions.ts on submit.
// 5. Clearly label any payment release as simulated, not real money.

export default function CollectionCenterPage() {
  return null;
}
