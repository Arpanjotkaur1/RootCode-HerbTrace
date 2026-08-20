// [MANSI] Certificate field mapping.
//
// What this is for: defines which Batch/Harvester fields map to which
// certificate field + display label, structured around WHO GACP / EU-style
// traceability documentation. Does NOT generate the PDF itself -- that's
// api/certificate/route.ts.
//
// IMPORTANT: this app does not grant real regulatory certification. The
// generated PDF must carry a disclaimer saying so -- see disclaimerText.
//
// Depends on: src/lib/types.ts -- CertificateData (Batch + Harvester).
// Blocks: src/app/api/certificate/route.ts (Mansi) -- the PDF layout reads this file's field list.
//
// Must output/return: CERTIFICATE_FIELDS (ordered field key/label/getValue
// list) and disclaimerText.
//
// TODO (Mansi):
// 1. Research real WHO GACP / EU herbal traceability fields to confirm this list is realistic.
// 2. Fill in display labels for each field.
// 3. Write disclaimerText clearly stating this is a demo/prototype document, not an official certificate.
// 4. Confirm field names line up once api/certificate/route.ts is built.

import type { CertificateData } from "@/lib/types";

export type CertificateField = {
  key: string;
  label: string;
  getValue: (data: CertificateData) => string;
};

export const CERTIFICATE_FIELDS: CertificateField[] = [];

export const disclaimerText = "";
