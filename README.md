# RootCode — HerbTrace (SIH25027 Prototype)

Verifiable, tamper-evident chain of custody for Ayurvedic herbs, from harvest
to consumer. Built for Smart India Hackathon internal screening.

This repo is a **pure API backend** — a Supabase-backed Next.js app with no
UI pages at all, only `src/app/api/**` routes. All UI (harvester capture,
consumer/exporter provenance page, Arpan's collection-center QC queue and
admin dashboard, the client-side species classifier) lives in separate
frontend repos that integrate with this backend over `fetch` against the
deployed API routes.

## Team (internal reference only — do not surface this breakdown in any user-facing UI copy)

- **Khushi** — architecture, Supabase schema, hash-chain ledger, AI
  species-verification integration, cross-module data flow, final
  integration, deploy reliability.
- **Saanvi** — separate repo: harvester capture UI (incl. the client-side
  species classifier), consumer/QR provenance page, design system.
  Integrates via the deployed API base URL.
- **Mansi** — certificate template/field mapping, compliance-oriented data
  mapping, demo herb/species metadata, research/demo data.
- **Arpan** — separate repo: collection-center QC queue UI, admin dashboard
  UI (ledger table, payment tracker, wallet balances, overharvest map).
  Integrates via `GET/POST /api/batches`, `POST /api/qc`, `GET /api/qr`,
  `GET /api/overharvest-zones` on this backend.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase values, see below
npm run dev
```

## Environment setup

See [.env.example](.env.example) for the required Supabase values
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`). These come from a Supabase project — see
manual actions below.

## Repo structure

```
src/
  lib/            — shared utilities: types, Supabase client, hash chain
  supabase/       — schema.sql (run first) and seed.sql (demo data)
  data/           — demo herb metadata, certificate field mapping, overharvest sample data
  app/
    api/          — batches, qc, qr, certificate, overharvest-zones routes
```

No `src/app` pages exist — this is an API-only Next.js app (`layout.tsx`,
`page.tsx`, `globals.css`, and the Tailwind/PostCSS config were removed once
the last UI page left this repo; a pages-free Next.js app builds fine
without them, verified with a real `next build`).

## What this backend must never claim

- Do not call the hash chain a "blockchain" anywhere in UI copy — it's
  server-side SHA-256 chaining stored in Postgres, not a deployed chain.
- Any simulated action (payment release, overharvest depletion data) must
  say so explicitly in UI copy.
- The certificate PDF is structured around WHO GACP / EU-style traceability
  fields but does not grant real regulatory certification — say so in the
  PDF itself.
- The overharvest map must be labeled "Illustrative Sample Data — Not Live
  Satellite Ingestion" near the map.

## Dependency order

1. `src/lib/types.ts` + `src/supabase/schema.sql` — done, block everything else.
2. `src/lib/hashChain.ts` — done, blocks batch submission and the ledger table.
3. `src/app/api/batches/route.ts` — done. Was the critical path; blocked
   Arpan's collection-center/admin repo, certificate generation, and
   Saanvi's separate frontend repo.
4. `src/app/api/qc/route.ts` — still a stub (Arpan's). Blocks QR generation
   and the payment tracker in his repo.
5. `src/data/certificateTemplate.ts` — still a stub (Mansi's). Blocks
   `src/app/api/certificate/route.ts`.
6. `src/app/api/overharvest-zones/route.ts` — done, no dependencies.

## Locked API contract — do not re-litigate

**Photo upload**: Saanvi's frontend uploads the harvest photo directly to a
public Supabase Storage bucket named `harvest-photos`, then sends the
resulting `photo_url` (plain string) in the JSON body of `POST /api/batches`.
This route never accepts or handles raw image bytes. The `harvest-photos`
bucket needs to be created in Supabase (manual action, alongside project
creation below).

**CORS**: since Saanvi's and Arpan's repos both call these API routes
cross-origin, `api/batches` and `api/overharvest-zones` allow any origin
(`Access-Control-Allow-Origin: *`) — safe since every response is public,
non-credentialed data. Apply the same pattern when building `api/qc`,
`api/qr`, and `api/certificate` for real.

## ⚠️ Manual actions needed (outside this coding session)

1. **Create the Supabase project** — sign up at supabase.com, create a
   project, paste the URL/anon key/service key into `.env.local`. Then run
   `src/supabase/schema.sql` in the SQL editor, followed by `seed.sql` once
   Mansi fills it in. Also create a public Storage bucket named
   `harvest-photos` (Saanvi's repo uploads harvest photos directly here —
   see "Locked API contract" above).
2. **Train/export the species classifier** — via Teachable Machine (browser
   tool). The classifier code and the harvester capture screen that uses it
   live entirely in Saanvi's separate repo now, so the exported TF.js files
   (`model.json`, `metadata.json`, `weights.bin`) go in her repo's
   `public/models/`. This repo has no `public/models/` at all anymore.
3. **Source real demo herb photos** — copyright-safe images per species,
   handed to Mansi (for `demoHerbs.ts` reference data) and Saanvi (for the
   classifier's training set in her repo). This repo has no `public/images/`
   to put them in — Mansi's `image_paths` field in `demoHerbs.ts` should
   point wherever the images actually end up hosted (e.g. Supabase Storage),
   not a local path in this repo.
4. **Deployment** — connect this repo to Vercel (or similar) yourself once
   the build passes locally. Hand the deployed URL to Saanvi and Arpan for
   their API base URL env vars.
5. **Live device testing** — camera/GPS behavior on a real phone (in
   Saanvi's repo) needs a human on a real device, not verifiable in a
   coding session.
6. **Final live QR code** — only possible once the frontend is deployed;
   this is a final-day task, not something to fake with a localhost link.
