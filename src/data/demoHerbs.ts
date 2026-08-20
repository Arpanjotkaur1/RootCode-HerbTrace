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
  plant_part: string;
  description: string;
  is_lookalike?: boolean;
  image_paths: string[];
};

export const DEMO_HERBS: DemoHerb[] = [
  {
    slug: "tulsi",
    common_name: "Tulsi (Holy Basil)",
    scientific_name: "Ocimum tenuiflorum",
    plant_part: "Leaves / Whole Aerial Parts (Ocimi sancti folium)",
    description:
      "Sacred Ayurvedic medicinal herb with adaptogenic, antioxidant, and respiratory benefits. Characterized by purple/green ovate leaves with strong therapeutic aroma.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "sweet-basil",
    common_name: "Sweet Basil",
    scientific_name: "Ocimum basilicum",
    plant_part: "Leaves / Whole Aerial Parts (Basilici herba)",
    description:
      "Culinary and aromatic medicinal herb frequently compared with Tulsi. Features smooth, bright-green cupped leaves and sweet anise-like aroma.",
    is_lookalike: true,
    image_paths: [
      "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "rama-tulsi",
    common_name: "Rama Tulsi (Broad Leaf Tulsi)",
    scientific_name: "Ocimum gratissimum",
    plant_part: "Leaves / Whole Aerial Parts",
    description:
      "Wild/broad-leafed basil rich in clove-like eugenol oils. Used for respiratory health and digestive support with broader, serrated foliage.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "american-basil",
    common_name: "American Basil (Hoary Basil)",
    scientific_name: "Ocimum americanum",
    plant_part: "Leaves / Whole Aerial Parts",
    description:
      "Annual herb with white flowers and narrow lanceolate leaves. Visual look-alike in wild harvest zones, often tested for species substitution.",
    is_lookalike: true,
    image_paths: [
      "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "kapoor-tulsi",
    common_name: "Kapoor Tulsi (Heavy Flowered Basil)",
    scientific_name: "Ocimum canum",
    plant_part: "Leaves / Whole Aerial Parts",
    description:
      "Aromatic Ayurvedic strain characterized by heavy flower spikes and sweet camphor aroma, traditionally used in herbal teas and skin preparations.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "camphor-basil",
    common_name: "Camphor Basil (African Blue Basil)",
    scientific_name: "Ocimum kilimandscharicum",
    plant_part: "Leaves / Whole Aerial Parts",
    description:
      "Strongly scented perennial with high camphor concentrations. Distinct dark veining; key reference in botanical substitution testing.",
    is_lookalike: true,
    image_paths: [
      "https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "ashwagandha",
    common_name: "Ashwagandha (Indian Ginseng)",
    scientific_name: "Withania somnifera",
    plant_part: "Dried Root (Withaniae radix)",
    description:
      "Premier Ayurvedic adaptogen and rasayana herb prized for stress resilience, physical vitality, and cognitive support.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "turmeric",
    common_name: "Turmeric (Haridra)",
    scientific_name: "Curcuma longa",
    plant_part: "Cured Rhizome (Curcumae longae rhizoma)",
    description:
      "Traditional golden rhizome rich in bio-active curcuminoids, widely utilized for natural anti-inflammatory and antioxidant wellness.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "brahmi",
    common_name: "Brahmi (Water Hyssop)",
    scientific_name: "Bacopa monnieri",
    plant_part: "Whole Aerial Plant (Bacopae monnieri herba)",
    description:
      "Classical Ayurvedic medhya rasayana prized for neuroprotection, memory retention, and mental acuity under the Ayurvedic Pharmacopoeia.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

/**
 * Returns the standard medicinal plant part associated with a species name,
 * matching WHO GACP / Ayurvedic monograph standards.
 */
export function getStandardPlantPart(speciesName: string): string {
  const normalized = speciesName.toLowerCase().trim();
  const match = DEMO_HERBS.find(
    (h) =>
      normalized.includes(h.slug) ||
      normalized.includes(h.common_name.toLowerCase()) ||
      normalized.includes(h.scientific_name.toLowerCase())
  );
  return match?.plant_part ?? "Whole Plant / Botanical Standard";
}

