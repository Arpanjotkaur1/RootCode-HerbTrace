import { createHash } from "crypto";

// Tamper-evident hash chain utility.
// This is NOT a blockchain -- there is no distributed consensus or deployed
// chain. It is a simple, well-understood pattern: each batch's hash commits
// to its own data plus the previous batch's hash, so editing any past batch
// changes every hash after it. Never call this a "blockchain" in UI copy.
//
// Server-side only (uses node:crypto) -- import this from API routes, not
// client components.

// Fields that go into the hash. Deliberately excludes fields that change
// after creation (qc_status, payment_status, etc.) -- the chain commits to
// the batch as captured at harvest time, not its later lifecycle state.
export type ChainableBatchData = {
  id: string;
  species_claimed: string;
  species_ai_result: string;
  confidence_score: number;
  gps_lat: number;
  gps_lon: number;
  harvester_id: string;
  photo_url: string;
  timestamp: string;
};

// Deterministic JSON: sorts keys so the same data always serializes the same
// way, regardless of insertion order.
function canonicalize(data: ChainableBatchData): string {
  const sortedKeys = Object.keys(data).sort() as (keyof ChainableBatchData)[];
  const sorted: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sorted[key] = data[key];
  }
  return JSON.stringify(sorted);
}

// hash = SHA256(canonical_batch_data + previous_batch_hash)
export function computeBatchHash(
  data: ChainableBatchData,
  prevHash: string | null
): string {
  const canonical = canonicalize(data);
  const input = canonical + (prevHash ?? "");
  return createHash("sha256").update(input).digest("hex");
}

// Re-derives a batch's hash from its stored data and prev_hash, and compares
// it to the stored hash. Used by the admin ledger table to show whether each
// link in the chain still verifies.
export function verifyBatchHash(
  data: ChainableBatchData,
  prevHash: string | null,
  storedHash: string
): boolean {
  return computeBatchHash(data, prevHash) === storedHash;
}
