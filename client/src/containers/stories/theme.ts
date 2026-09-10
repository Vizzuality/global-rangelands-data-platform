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
  /** Gradient start color class for the band that fades the pattern out behind the header. */
  headerGradient: string;
  /** Text-stroke utility painting the page background color around section headings. */
  chromeStroke: string;
};

type CategoryPalette = Omit<CategoryTheme, "cardVariant">;

const PALETTES: Record<string, CategoryPalette> = {
  "atlas-stories": {
    pageBackground: "bg-brown-dark",
    heroAccent: "bg-green-dark",
    heroDiamondOutline: "border-green-bright",
    chromeText: "text-white",
    patternColor: "bg-green-medium",
    headerGradient: "from-brown-dark",
    chromeStroke: "[-webkit-text-stroke:2px_theme(colors.brown-dark)] [paint-order:stroke_fill]",
  },
  "restoration-investments": {
    pageBackground: "bg-orange-bright",
    heroAccent: "bg-brown-dark",
    heroDiamondOutline: "border-orange-bright",
    chromeText: "text-brown-dark",
    patternColor: "bg-brown-dark",
    headerGradient: "from-orange-bright",
    chromeStroke: "[-webkit-text-stroke:2px_theme(colors.orange-bright)] [paint-order:stroke_fill]",
  },
  "restoration-champions": {
    pageBackground: "bg-green-light",
    heroAccent: "bg-green-medium",
    heroDiamondOutline: "border-gold",
    chromeText: "text-white",
    patternColor: "bg-green-medium",
    headerGradient: "from-green-light",
    chromeStroke: "[-webkit-text-stroke:2px_theme(colors.green-light)] [paint-order:stroke_fill]",
  },
};

const PALETTE_DEFAULT = PALETTES["atlas-stories"];

export function getCategoryTheme(slug: string): CategoryTheme {
  return {
    ...(PALETTES[slug] ?? PALETTE_DEFAULT),
    cardVariant: STORY_CARD_LANDING_VARIANT,
  };
}
