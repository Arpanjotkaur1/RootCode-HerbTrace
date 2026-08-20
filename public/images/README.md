# Demo herb photos go here

⚠️ MANUAL ACTION NEEDED (Khushi + Mansi): source a handful of copyright-safe
photos per demo species (own photos, or public-domain/government sources —
do not scrape random web images) and place them here.

## Layout

```
public/images/herbs/<species-slug>/1.jpg, 2.jpg, ...
```

Species slugs must match `src/data/demoHerbs.ts` (`DEMO_HERBS[].slug`), e.g.
`public/images/herbs/ashwagandha/`.

## What these are used for

1. **Teachable Machine training data** — the same images can be uploaded as
   training samples for the species classifier (see `public/models/README.md`).
   More images per class (5-10+) gives more reliable demo predictions.
2. **Reference display** — e.g. the admin dashboard or certificate PDF may
   want a reference photo of the claimed species alongside the harvester's
   actual capture photo.

Note: the harvester's *actual capture photo* at demo time is a live camera
photo uploaded from Saanvi's separate frontend repo into Supabase Storage —
it does not live in this folder. This folder is only for reference/training
images.
