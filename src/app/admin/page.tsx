// [ARPAN] Admin dashboard page.
//
// What this is for: internal overview screen -- ledger table (hash chain),
// payment tracker, harvester wallet balances, and the illustrative
// overharvest map. See README.md in this folder for the full spec.
//
// Depends on:
// - GET /api/batches (Khushi, critical path) -- full batch list.
// - src/lib/hashChain.ts -- verifyBatchHash() (Khushi, already built) for
//   the optional per-row verified/broken badge.
// - src/data/overharvestZones.ts (Arpan, this repo) -- map marker data.
// - src/lib/types.ts -- Batch, Harvester, OverharvestZone types.
//
// Must output/return: renders the ledger table, payment tracker, wallet
// balances, and Leaflet map with the required "Illustrative Sample Data --
// Not Live Satellite Ingestion" label visible near the map.
//
// TODO (Arpan):
// 1. Fill in src/data/overharvestZones.ts first (no dependencies).
// 2. Build the Leaflet map with the required illustrative-data label.
// 3. Build the ledger table (batch id, species claimed/verified, qc_status, hash, prev_hash).
// 4. Build the payment tracker + harvester wallet balance table.
// 5. Optional: verified/broken badge per row using verifyBatchHash().

export default function AdminPage() {
  return null;
}
