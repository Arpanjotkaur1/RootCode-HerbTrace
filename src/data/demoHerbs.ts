// [MANSI] Demo species metadata.
//
// Trimmed to the 5 species the classifier actually recognizes -- see
// DEMO_SPECIES_CLASSES in src/lib/species-classifier.ts. Species here and
// the classifier's class names must match exactly (case-sensitive), since
// batches store species_claimed/species_ai_result as free text compared
// against these. If the list changes on either side, update both files
// together.
//
// Used by: the classifier's class list, Saanvi's species picker (her
// separate repo), and the certificate template (getStandardPlantPart).

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
    slug: "ashwagandha",
    common_name: "Ashwagandha",
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
    slug: "brahmi",
    common_name: "Brahmi",
    scientific_name: "Bacopa monnieri",
    plant_part: "Whole Aerial Plant (Bacopae monnieri herba)",
    description:
      "Classical Ayurvedic medhya rasayana prized for neuroprotection, memory retention, and mental acuity under the Ayurvedic Pharmacopoeia.",
    is_lookalike: false,
    image_paths: [
      "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    slug: "tulsi",
    common_name: "Tulsi",
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
    // TODO (Mansi/Khushi): no real photo sourced yet -- image_paths left
    // empty rather than guessing an unverified URL. Fill in a copyright-safe
    // neem photo (own photo or public-domain/government source) before this
    // is used for classifier training or the provenance page.
    slug: "neem",
    common_name: "Neem",
    scientific_name: "Azadirachta indica",
    plant_part: "Dried Leaves (Azadirachtae folium)",
    description:
      "Widely used Ayurvedic herb for skin health, immune support, and natural pest resistance. Compound pinnate leaves with serrated, pointed leaflets.",
    is_lookalike: false,
    image_paths: [],
  },
  {
    slug: "lookalike",
    common_name: "Lookalike (non-medicinal)",
    scientific_name: "Ocimum basilicum (Sweet Basil)",
    plant_part: "Leaves / Whole Aerial Parts (Basilici herba)",
    description:
      "Culinary basil frequently mistaken for Tulsi in the field -- used to demo AI mismatch detection when a harvester claims a medicinal species but the classifier flags a visual lookalike. Smooth, bright-green cupped leaves, sweet anise-like aroma (vs. Tulsi's stronger, more peppery scent).",
    is_lookalike: true,
    image_paths: [
      "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?auto=format&fit=crop&w=800&q=80",
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
