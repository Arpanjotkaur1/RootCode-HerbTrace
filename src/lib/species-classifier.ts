"use client";

import type { SpeciesClassificationResult } from "./types";

// Client-side species classifier wrapper, loading a Teachable Machine /
// TF.js image model exported into public/models/.
//
// This lives in the backend repo as the canonical source, but it's
// browser-only code ("use client") that has to run wherever the harvester
// capture screen actually renders -- Saanvi's separate frontend repo needs
// its own copy of this file (plus the trained model files) to actually use
// it. This repo doesn't import it anywhere itself.
//
// ⚠️ Until Khushi trains and exports the real model (see root README.md,
// MANUAL ACTION #2), MODEL_READY is false and classify() returns a
// deterministic mock result. This lets the harvester capture UI build and
// test the full confirm/submit flow today without waiting on the trained
// model. Swap MODEL_READY to true once public/models/model.json (and
// metadata.json, weights.bin) exist.

const MODEL_READY = false;
const MODEL_URL = "/models/model.json";
const METADATA_URL = "/models/metadata.json";

// Must match the class names used when training in Teachable Machine.
// Keep this list in sync with src/data/demoHerbs.ts.
export const DEMO_SPECIES_CLASSES = [
  "Ashwagandha",
  "Brahmi",
  "Tulsi",
  "Neem",
  "Lookalike (non-medicinal)",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedModel: any = null;

async function loadModel() {
  if (cachedModel) return cachedModel;
  // Dynamic import so this heavy dependency is never pulled into a server bundle.
  const tmImage = await import("@teachablemachine/image");
  cachedModel = await tmImage.load(MODEL_URL, METADATA_URL);
  return cachedModel;
}

// Runs inference on an image element/canvas and returns the top prediction.
// imageElement should be an <img> or <canvas> already showing the harvester's photo.
export async function classifySpecies(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<SpeciesClassificationResult> {
  if (!MODEL_READY) {
    return mockClassify();
  }

  const model = await loadModel();
  const predictions: { className: string; probability: number }[] =
    await model.predict(imageElement);

  const top = predictions.reduce((best, current) =>
    current.probability > best.probability ? current : best
  );

  return { species: top.className, confidence: top.probability };
}

// Deterministic-ish mock so the UI has something realistic to render and
// harvesters can practice the "confirm before submit" step during dev.
function mockClassify(): SpeciesClassificationResult {
  const species =
    DEMO_SPECIES_CLASSES[
      Math.floor(Math.random() * (DEMO_SPECIES_CLASSES.length - 1))
    ]; // never mock the lookalike, keep the happy path obvious in dev
  const confidence = 0.75 + Math.random() * 0.2; // 0.75 - 0.95
  return { species, confidence: Number(confidence.toFixed(4)) };
}

export const isModelReady = () => MODEL_READY;
