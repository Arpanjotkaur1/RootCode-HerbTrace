# RootCode — HerbTrace (SIH25027 Prototype)

Verifiable, tamper-evident chain of custody for Ayurvedic herbs, from harvest
to consumer. Built for Smart India Hackathon internal screening.

This repo is the **backend + internal dashboards** (Supabase-backed Next.js
app: collection-center QC queue, admin dashboard, and the API routes
everything talks to). The harvester capture flow and the consumer/exporter
provenance page live in a **separate frontend repo** owned by Saanvi, which
integrates with this backend over `fetch` against the deployed API routes.

## Team (internal reference only — do not surface this breakdown in any user-facing UI copy)

- **Khushi** — architecture, Supabase schema, hash-chain ledger, AI
  species-verification integration, cross-module data flow, final
  integration, deploy reliability.
- **Saanvi** — separate repo: harvester capture UI, consumer/QR provenance
  page, design system. Integrates via the deployed API base URL.
- **Mansi** — certificate template/field mapping, compliance-oriented data
  mapping, demo herb/species metadata, research/demo data.
- **Arpan** — collection-center QC queue, payment release logic, harvester
  wallet simulation, QR generation trigger, admin dashboard.

## Running locally

```bash
npm install --legacy-peer-deps   # required: @teachablemachine/image declares an outdated tfjs peer dep
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
  lib/            — shared utilities: types, Supabase client, hash chain, species classifier
  supabase/       — schema.sql (run first) and seed.sql (demo data)
  data/           — demo herb metadata, certificate field mapping, overharvest sample data
  app/
    collection-center/  — QC queue (Arpan)
    admin/               — ledger/payment/map dashboard (Arpan)
    api/                 — batches, qc, qr, certificate, species-classify routes
```

Each folder owned by a teammate has its own `README.md` with the specific
brief, inputs/outputs, and TODOs — read that before writing code in it.

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
3. `src/app/api/batches/route.ts` — **critical path, not yet built**. Blocks
   the collection-center queue, the admin ledger, certificate generation,
   and Saanvi's separate frontend repo entirely.
4. `src/app/api/qc/route.ts` — blocks QR generation and the payment tracker.
5. `src/data/certificateTemplate.ts` — blocks `src/app/api/certificate/route.ts`.
6. `src/data/overharvestZones.ts` — no dependencies, safe to build anytime.

## Locked API contract — do not re-litigate

**Photo upload**: Saanvi's frontend uploads the harvest photo directly to a
public Supabase Storage bucket named `harvest-photos`, then sends the
resulting `photo_url` (plain string) in the JSON body of `POST /api/batches`.
This route never accepts or handles raw image bytes. The `harvest-photos`
bucket needs to be created in Supabase (manual action, alongside project
creation below).

**CORS**: since Saanvi's repo calls these API routes cross-origin, the API
routes need CORS headers added for her deployed origin. Not done yet —
needs to land when `api/batches/route.ts` is built for real.

## ⚠️ Manual actions needed (outside this coding session)

1. **Create the Supabase project** — sign up at supabase.com, create a
   project, paste the URL/anon key/service key into `.env.local`. Then run
   `src/supabase/schema.sql` in the SQL editor, followed by `seed.sql` once
   Mansi fills it in. Also create a public Storage bucket named
   `harvest-photos` (Saanvi's repo uploads harvest photos directly here —
   see "Locked API contract" above).
2. **Train/export the species classifier** — via Teachable Machine (browser
   tool), export TF.js files into `public/models/` — see that folder's README.
3. **Source real demo herb photos** — copyright-safe images per species into
   `public/images/herbs/<slug>/` — see that folder's README.
4. **Deployment** — connect this repo to Vercel (or similar) yourself once
   the build passes locally. Hand the deployed URL to Saanvi for her API
   base URL env var.
5. **Live device testing** — camera/GPS behavior on a real phone (in
   Saanvi's repo) needs a human on a real device, not verifiable in a
   coding session.
6. **Final live QR code** — only possible once the frontend is deployed;
   this is a final-day task, not something to fake with a localhost link.
