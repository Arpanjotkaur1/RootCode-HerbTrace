// [ARPAN] QR generation for an approved batch.
//
// What this is for: produces a QR code encoding the URL to Saanvi's
// provenance page for a given batch, using the `qrcode` npm package.
//
// Depends on:
// - src/app/api/batches/route.ts (Khushi, critical path) -- to look up the batch.
// - api/qc/route.ts (Arpan, this folder) -- ideally only generate QR after QC passes.
// - The deployed frontend base URL (final live QR can only point at the real
//   deployed URL once Khushi deploys -- that's a final-day manual step, not
//   something to fake here with localhost).
//
// Must output/return: GET ?batchId=... returns a QR code (data URL or PNG)
// encoding {frontendBaseUrl}/provenance/{batchId}.
//
// TODO (Arpan):
// 1. Look up the batch to confirm it exists (and optionally that qc_status === "pass").
// 2. Generate the QR code with the `qrcode` package.
// 3. Decide data URL vs. downloadable PNG based on how the admin/collection-center UI wants to use it.

// force-dynamic: not logic, just tells Next.js not to prerender this GET
// route at build time (it will need live DB reads once implemented, and an
// empty stub body otherwise fails `next build`'s static export step).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {}
