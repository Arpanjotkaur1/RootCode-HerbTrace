# Collection Center QC Queue — brief for Arpan

## What this page is

This is the page a collection-center worker opens to review batches that
harvesters have submitted. In plain terms: it lists pending batches, you
(the worker) inspect each one and approve or reject it. On approve, the app
automatically releases the simulated payment to that harvester's wallet.

## The flow, step by step

1. Page loads and shows a list/queue of batches where `qc_status === "pending"`.
2. Worker clicks a batch to see its details: photo, claimed species, AI
   species result + confidence, GPS location, timestamp, harvester name.
3. Worker decides Pass or Fail, optionally with a short note (e.g. "species
   mismatch" or "photo unclear").
4. On submit, call `POST /api/qc` with the decision. That endpoint (which you
   also own — see `api/qc/route.ts`) updates `qc_status`, and if the
   decision is "pass", releases a simulated payment and bumps the
   harvester's `wallet_balance`.
5. Batch disappears from the pending queue, moves to a "recently reviewed"
   list (nice-to-have, not required for MVP).

## What you need from other modules (inputs)

- `GET /api/batches` (Khushi, not built yet) — to list pending batches. This
  is the critical-path file blocking you; while waiting, use the stub in
  `actions.ts` (`fetchPendingBatches`) which returns an empty array, and
  build your UI against fake/mock batch objects shaped like `Batch` in
  `src/lib/types.ts`.
- Design tokens: `tailwind.config.ts`. Shared UI components (buttons,
  badges, cards) will land in `src/components/ui/` (Saanvi) — use those once
  available instead of building your own from scratch.

## What you must produce (outputs)

- `src/app/api/qc/route.ts` — you own this too. It should: accept
  `{ batchId, decision, notes }`, update the batch's `qc_status`,
  `qc_notes`, `qc_timestamp`, and if `decision === "pass"`: set
  `payment_status = "released"`, set a `payment_amount`, and increment the
  matching harvester's `wallet_balance`. This blocks QR generation and the
  admin payment tracker, so prioritize it once `api/batches` exists.

## TODO

1. Build the pending-batch list UI (use stub data from `actions.ts` for now).
2. Build the batch detail/inspect view (photo, species, GPS, AI confidence badge).
3. Build the pass/fail decision UI with a notes field.
4. Wire `submitQcDecision()` in `actions.ts` to real state once `/api/qc` exists.
5. Build `src/app/api/qc/route.ts` (pass/fail + payment release + wallet update).
6. Make sure the UI clearly labels the payment release as **simulated** —
   don't imply real money is moving.
