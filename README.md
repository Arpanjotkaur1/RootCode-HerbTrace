# HerbTrace

**Verifiable, tamper-evident chain of custody for Ayurvedic herbs — from harvest to consumer.**

Built for Smart India Hackathon (SIH25027 — *"Blockchain-based system for botanical traceability of Ayurvedic herbs"*, Ministry of AYUSH) by Team RootCode.

**Live API:** `https://rootcode-herbtrace-api.onrender.com`

---

## What this is

India's Ayurvedic herb supply chain has no verifiable record connecting a harvested plant to the labeled product a consumer or exporter eventually sees. That gap enables species substitution, undermines export documentation, and lets middlemen control the only payment records that exist — leaving harvesters with no leverage over what they're actually paid.

HerbTrace addresses this with four pillars:

1. **AI species verification at harvest** — the harvester photographs the plant before cutting it; a client-side model returns a species guess and confidence score; GPS and timestamp attach automatically; the harvester confirms before anything is submitted.
2. **Tamper-evident ledger tied to payment** — each batch is cryptographically chained to the one before it (`SHA-256(batch data + previous hash)`). Passing quality control releases a simulated payment and updates the harvester's wallet balance in the same step.
3. **Illustrative overharvest monitoring** — a map layer of sample depletion-risk data, explicitly labeled as illustrative, not live satellite ingestion.
4. **Auto-generated export certificate** — a real PDF built from a batch's actual data, structured around WHO GACP / EU-style traceability fields, without claiming regulatory certification.

## What's real vs. simulated

Said plainly, because hedging on this is worse than stating it:

| Real and live | Simulated / sample data |
|---|---|
| The batch API, hash chain, and Postgres database | Payment release and wallet balances (no real money moves) |
| The species classifier (trained model, real inference) | Overharvest depletion scores (sample data, not satellite feeds) |
| QC pass/fail, QR generation, certificate PDFs | |

## Architecture

This repo is a **pure API backend** — a Supabase-backed Next.js app with no UI pages. It exists to be the single source of truth that every client (harvester capture app, collection-center dashboard, consumer provenance page) calls into, rather than talking to the database directly.

```
                    ┌─────────────────────────┐
  Harvester UI ───▶ │                         │
  Collection UI ──▶ │   HerbTrace API         │ ───▶  Supabase (Postgres + Storage)
  Consumer page ──▶ │   (this repo)           │
                    └─────────────────────────┘
```

The one exception: harvest photos upload **directly** from the client to Supabase Storage (bucket `harvest-photos`, public) — this API only ever receives the resulting URL, never raw image bytes.

## API reference

Base URL: `https://rootcode-herbtrace-api.onrender.com` — no authentication, CORS open on every route.

| Method & path | What it does |
|---|---|
| `GET /api/batches` | List batches — `?id=`, `?qc_status=`, `?harvester_id=` filters |
| `POST /api/batches` | Submit a harvested batch; computes and stores the hash chain |
| `POST /api/qc` | Pass/fail a batch; on pass, releases payment and credits the harvester's wallet |
| `GET /api/qr` | Generate a QR for a batch (only once it has passed QC) |
| `GET /api/certificate` | Generate the export-compliance PDF for a batch |
| `GET /api/overharvest-zones` | List illustrative depletion-risk zones |
| `GET /api/harvesters` | List harvesters and wallet balances |
| `GET /api/health` | No-op check — hit this to wake the instance before a demo |

Full request/response shapes, required fields, and error codes are documented in each route file's header comment.

### Locked contracts — do not change without team sign-off

- **Photo upload**: client uploads directly to the `harvest-photos` Supabase Storage bucket and sends only the resulting `photo_url` string to `POST /api/batches`. This API never accepts image bytes.
- **`quantity_kg` is required** on `POST /api/batches` — it's the basis for the QC payment calculation (`quantity_kg × ₹50/kg`, hardcoded rate).
- **Species names** must exactly match across `species_claimed`, `species_ai_result`, and the classifier's output classes: `Ashwagandha`, `Brahmi`, `Tulsi`, `Neem`, `Lookalike (non-medicinal)`.
- The hash chain is **never** referred to as "blockchain" in any user-facing copy.
- The overharvest map must carry the label *"Illustrative Sample Data — Not Live Satellite Ingestion"* wherever it's shown.

## Getting started

```bash
git clone https://github.com/Arpanjotkaur1/RootCode-HerbTrace.git
cd RootCode-HerbTrace
npm install --legacy-peer-deps   # required: @teachablemachine/image declares an outdated tfjs peer dep
cp .env.example .env.local       # fill in your Supabase project values
npm run dev
```

### Environment variables

See [`.env.example`](.env.example):

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page, "anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page, "service_role" — **server-side only, never expose to a client** |

### Database setup

Run [`src/supabase/schema.sql`](src/supabase/schema.sql) in the Supabase SQL Editor, then [`src/supabase/seed.sql`](src/supabase/seed.sql) for demo data. Also create a **public** Storage bucket named exactly `harvest-photos`, with RLS policies allowing `anon` to `INSERT` and `SELECT` on it (see `schema.sql` for the reference policies used on the tables — Storage policies are configured separately in the Storage section of the dashboard or via SQL against `storage.objects`).

## Project structure

```
src/
  lib/            shared utilities — types, Supabase client, hash chain,
                   and the species classifier (canonical source; the
                   classifier itself runs client-side in the harvester app,
                   not in this repo)
  supabase/       schema.sql and seed.sql
  data/           demo herb metadata, certificate field mapping,
                   overharvest sample data
  app/api/        the seven routes listed above — the entire surface of
                   this app; there are no UI pages
```

## Data model

```ts
type Batch = {
  id: string;
  species_claimed: string;
  species_ai_result: string;
  confidence_score: number;        // 0–1
  gps_lat: number;
  gps_lon: number;
  harvester_id: string;
  photo_url: string;
  timestamp: string;                // ISO 8601
  quantity_kg: number;
  qc_status: "pending" | "pass" | "fail";
  qc_notes: string | null;
  qc_timestamp: string | null;
  prev_hash: string | null;
  hash: string;
  payment_status: "pending" | "released";
  payment_amount: number | null;
};

type Harvester = { id: string; name: string; wallet_balance: number };

type OverharvestZone = { id: string; region: string; lat: number; lon: number; depletion_score: number };
```

## Team & related repos

RootCode is four people; this repo is the shared backend all client apps integrate against.

| Person | Owns | Repo |
|---|---|---|
| Khushi | Architecture, schema, hash chain, deployment, cross-module integration | this repo |
| Arpan | Collection-center QC queue, payment logic, admin dashboard, QR generation | separate frontend repo |
| Saanvi | Harvester capture UI, species classifier integration, consumer/QR provenance page | [`saanvi-006/rootcode-trace`](https://github.com/saanvi-006/rootcode-trace) |
| Mansi | Certificate template, compliance field mapping, demo herb metadata | this repo (`src/data/`, `src/app/api/certificate/`) |

## Deployment

Hosted on Render (free tier). The build command is `npm install --legacy-peer-deps && npm run build`; the start command is `next start -p $PORT`. Free-tier instances sleep after ~15 minutes of inactivity and take 30–50s to wake on the next request — hit `GET /api/health` a few minutes before any live demo to avoid that delay in front of an audience.

## Known limitations

- Live camera/GPS behavior has only been verified through the API layer, not on a physical device in the field.
- The batches table's hash-chain lookup (find the most recent batch, then insert) is not race-safe under concurrent submissions — acceptable for a single-demo prototype, would need a database-level lock or transaction for production use.
- The overharvest layer is explicitly sample data; a production version would need a real satellite/NDVI data source.
