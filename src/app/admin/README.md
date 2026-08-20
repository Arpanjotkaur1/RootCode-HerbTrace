# Admin Dashboard — brief for Arpan

## What this page is

The internal overview screen: a ledger table of every batch (showing the
hash chain), payment/wallet tracking, and a map of the illustrative
overharvest data. This is what a judge sees if they want proof the whole
system is coherent, not just one flow.

## What it needs to show

1. **Ledger table** — every batch, one row each, showing at minimum:
   `id`, `species_claimed`, `species_ai_result`, `qc_status`, `hash`,
   `prev_hash`. Optionally show a verified/broken badge per row by re-running
   `verifyBatchHash()` from `src/lib/hashChain.ts` (Khushi already built this
   — import and use it, don't reimplement hashing here).
2. **Payment tracker** — batches grouped or filterable by `payment_status`,
   showing `payment_amount` where released.
3. **Harvester wallet balances** — a simple table of harvesters and their
   `wallet_balance`.
4. **Leaflet map** — plots `OVERHARVEST_ZONES` from `src/data/overharvestZones.ts`
   (you own that file too) as colored markers/circles by `depletion_score`.
   **Required UI label, verbatim, visible near the map**: "Illustrative
   Sample Data — Not Live Satellite Ingestion". Do not remove or soften this
   — we are not claiming real remote-sensing.

## What you need from other modules (inputs)

- `GET /api/batches` (Khushi, not built yet) — full batch list for the
  ledger table and payment tracker. Blocks you; stub with mock data shaped
  like `Batch` from `src/lib/types.ts` while waiting.
- Harvester wallet data — likely also served from `/api/batches` or a small
  `/api/harvesters` endpoint; confirm the shape with Khushi once she's
  building the batches API.
- `src/lib/hashChain.ts` (Khushi, already built) — use `verifyBatchHash()`
  for the optional verified/broken badge.
- `src/data/overharvestZones.ts` (you own this — fill in the TODO there first,
  it has no dependencies so it's a good first task while waiting on the API).
- Design tokens: `tailwind.config.ts`. Shared UI components: `src/components/ui/`.

## TODO

1. Fill in `src/data/overharvestZones.ts` with sample zones (no dependencies,
   start here).
2. Build the Leaflet map with the required "illustrative data" label.
3. Build the ledger table (stub data first, wire to `/api/batches` once live).
4. Build the payment tracker view.
5. Build the harvester wallet balance table.
6. Optional polish: hash verified/broken badge per ledger row using
   `verifyBatchHash()`.
