// [MANSI] Demo species metadata.
//
// What this is for: source of truth for the 4-5 demo species -- used by the
// classifier's class list, Saanvi's species picker (her separate repo), and
// the certificate template.
//
// Depends on: DEMO_SPECIES_CLASSES, the classifier's class list -- now
// defined in Saanvi's separate frontend repo (the classifier moved there
// along with the harvester capture screen). The species list here must
// match hers exactly; confirm the list with her/Khushi.
//
// Must output/return: DEMO_HERBS, an array with common_name, scientific_name,
// a short description, and image paths per species.
//
// TODO (Mansi):
// 1. Confirm the final 4-5 species list with Khushi (include one lookalike
//    non-medicinal species to demo mismatch detection).
// 2. Fill in real common_name/scientific_name/description for each.
// 3. Source copyright-safe demo photos per species (own photos or public
//    domain/government sources). This repo has no public/images/ folder --
//    image_paths below should point wherever the images actually end up
//    hosted (e.g. a Supabase Storage URL), not a local path in this repo.
// 4. These same photos can double as Teachable Machine training images in
//    Saanvi's repo, which owns the classifier now.

export type DemoHerb = {
  slug: string;
  common_name: string;
  scientific_name: string;
  description: string;
  image_paths: string[];
};

export const DEMO_HERBS: DemoHerb[] = [];
