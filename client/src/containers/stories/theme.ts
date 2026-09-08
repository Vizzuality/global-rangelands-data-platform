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
  /** Text color class for content drawn straight over the page background (header chrome, section headings). */
  chromeText: string;
  /** Bg color class painted through the background pattern mask. */
  patternColor: string;
};

type CategoryPalette = Omit<CategoryTheme, "cardVariant">;

const PALETTES: Record<string, CategoryPalette> = {
  "atlas-stories": {
    pageBackground: "bg-brown-dark",
    heroAccent: "bg-green-dark",
    heroDiamondOutline: "border-green-bright",
    chromeText: "text-white",
    patternColor: "bg-green-medium",
  },
  "restoration-investments": {
    pageBackground: "bg-orange-bright",
    heroAccent: "bg-brown-dark",
    heroDiamondOutline: "border-orange-bright",
    chromeText: "text-brown-dark",
    patternColor: "bg-brown-dark",
  },
  "restoration-champions": {
    pageBackground: "bg-green-light",
    heroAccent: "bg-green-medium",
    heroDiamondOutline: "border-gold",
    chromeText: "text-white",
    patternColor: "bg-green-medium",
  },
};

const PALETTE_DEFAULT = PALETTES["atlas-stories"];

export function getCategoryTheme(slug: string): CategoryTheme {
  return {
    ...(PALETTES[slug] ?? PALETTE_DEFAULT),
    cardVariant: STORY_CARD_LANDING_VARIANT,
  };
}
