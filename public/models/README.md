# Trained species classifier goes here

⚠️ MANUAL ACTION NEEDED (Khushi): train and export the species classifier
outside this coding session, then drop the exported files directly into this
folder.

## How

1. Go to [Teachable Machine](https://teachablemachine.withgoogle.com/) (Image
   Project, Standard image model).
2. Create one class per demo species (see `DEMO_SPECIES_CLASSES` in
   `src/lib/species-classifier.ts` and `src/data/demoHerbs.ts` for the list
   — keep names identical, including capitalization).
3. Upload sample images per class (Mansi is sourcing copyright-safe demo
   photos — see `src/data/demoHerbs.ts` TODOs).
4. Train in-browser, then Export Model -> Tensorflow.js -> Download.
5. Unzip and place the three files directly in this folder:
   - `model.json`
   - `metadata.json`
   - `weights.bin`

## After the files are here

Open `src/lib/species-classifier.ts` and flip `MODEL_READY` from `false` to
`true`. Everything else (loading, inference, the confidence badge on the
harvester UI in Saanvi's repo) is already wired to expect this exact file
layout.

Large model files are intentionally NOT gitignored (see root `.gitignore`)
so teammates can pull the trained model directly instead of re-training —
reconsider that if the exported files end up larger than a few MB.
