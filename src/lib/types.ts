// Shared data contracts for RootCode / HerbTrace.
// Every module (harvester capture, collection-center QC, provenance page,
// certificate generation, admin dashboard) imports types from here.
// If you need a new field, add it here first so everyone sees the same shape --
// do not redefine these types locally in a page or component.

export type QCStatus = "pending" | "pass" | "fail";
export type PaymentStatus = "pending" | "released";

export type Batch = {
  id: string;
  species_claimed: string;
  species_ai_result: string;
  confidence_score: number; // 0-1
  gps_lat: number;
  gps_lon: number;
  harvester_id: string;
  photo_url: string;
  timestamp: string; // ISO 8601, when the batch was captured
  qc_status: QCStatus;
  qc_notes: string | null; // set by collection center on pass/fail
  qc_timestamp: string | null; // ISO 8601, when QC decision was made
  prev_hash: string | null; // hash of the previous batch in the chain, null for the first batch
  hash: string; // SHA256(canonical_batch_data + prev_hash)
  payment_status: PaymentStatus;
  payment_amount: number | null; // set on payment release
};

export type Harvester = {
  id: string;
  name: string;
  wallet_balance: number;
};

export type OverharvestZone = {
  id: string;
  region: string;
  lat: number;
  lon: number;
  depletion_score: number; // 0-100, illustrative only -- NOT live satellite data
};

// Result shape returned by the client-side species classifier
// (src/lib/species-classifier.ts) before the harvester confirms it.
export type SpeciesClassificationResult = {
  species: string;
  confidence: number; // 0-1
};

// Field mapping used by src/data/certificateTemplate.ts and
// src/app/api/certificate/route.ts to render the WHO GACP / EU-style PDF.
// Derived entirely from a Batch + Harvester -- not stored separately.
export type CertificateData = {
  batch: Batch;
  harvester: Harvester;
  generated_at: string; // ISO 8601, when the certificate PDF was generated
};
