import { STORY_CARD_LANDING_VARIANT } from "./categories";

export type CategoryTheme = {
  /** Full-page background class for the category landing/detail chrome. */
  pageBackground: string;
  /** Bg class for the accent bars flanking the hero and the story cards, and for the filled hero diamond. */
  heroAccent: string;
  /** Border class for the outlined diamond behind the hero card. */
  heroDiamondOutline: string;
  /** Bg + text classes for story cards on the standalone landing/detail pages. */
  cardVariant: string;
};

type CategoryPalette = Omit<CategoryTheme, "cardVariant">;

const PALETTES: Record<string, CategoryPalette> = {
  "atlas-stories": {
    pageBackground: "bg-brown-dark",
    heroAccent: "bg-green-dark",
    heroDiamondOutline: "border-green-bright",
  },
  "restoration-investments": {
    pageBackground: "bg-orange-bright",
    heroAccent: "bg-brown-dark",
    heroDiamondOutline: "border-orange-bright",
  },
  "restoration-champions": {
    pageBackground: "bg-green-light",
    heroAccent: "bg-green-medium",
    heroDiamondOutline: "border-gold",
  },
};

const PALETTE_DEFAULT = PALETTES["atlas-stories"];

export function getCategoryTheme(slug: string): CategoryTheme {
  return {
    ...(PALETTES[slug] ?? PALETTE_DEFAULT),
    cardVariant: STORY_CARD_LANDING_VARIANT,
  };
}
