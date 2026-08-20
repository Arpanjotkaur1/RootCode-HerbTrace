// [MANSI] Certificate PDF generation endpoint.
//
// What this is for: builds and returns a downloadable PDF certificate for a
// batch, using @react-pdf/renderer.
//
// Depends on:
// - src/app/api/batches/route.ts (Khushi, critical path) -- to fetch the batch + harvester.
// - src/data/certificateTemplate.ts (Mansi, this repo) -- field list + disclaimer.
// - src/lib/types.ts -- CertificateData type.
//
// Must output/return: GET ?batchId=... returns a PDF file built from
// CERTIFICATE_FIELDS, always including disclaimerText.
//
// TODO (Mansi):
// 1. Fill in the TODOs in src/data/certificateTemplate.ts first.
// 2. Fetch the batch + harvester via getServiceSupabase() (src/lib/supabase.ts).
// 3. Build a CertificateData object.
// 4. Render the PDF with @react-pdf/renderer using CERTIFICATE_FIELDS + disclaimerText.
// 5. Return it as a downloadable file response.

// force-dynamic: not logic, just tells Next.js not to prerender this GET
// route at build time (it will need live DB reads once implemented, and an
// empty stub body otherwise fails `next build`'s static export step).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {}
