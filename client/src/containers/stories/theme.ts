import {
  CATEGORY_TITLE_COLOR,
  CATEGORY_TITLE_DEFAULT_COLOR,
  STORY_CARD_LANDING_VARIANT,
} from "./categories";

export type CategoryTheme = {
  /** Full-page background class for the category landing/detail chrome. */
  pageBackground: string;
  /** Bg class for the accent bars flanking the hero/content card. */
  heroAccent: string;
  /** Bg + text classes for story cards on the standalone landing/detail pages. */
  cardVariant: string;
  /** Text color class for headings rendered outside the white hero card. */
  titleColor: string;
};

const PAGE_BACKGROUND: Record<string, string> = {
  "atlas-stories": "bg-brown-dark",
  "restoration-investments": "bg-orange-bright",
  "restoration-champions": "bg-green-light",
};
const PAGE_BACKGROUND_DEFAULT = "bg-brown-dark";

const HERO_ACCENT = "bg-green-dark";

export function getCategoryTheme(slug: string): CategoryTheme {
  return {
    pageBackground: PAGE_BACKGROUND[slug] ?? PAGE_BACKGROUND_DEFAULT,
    heroAccent: HERO_ACCENT,
    cardVariant: STORY_CARD_LANDING_VARIANT,
    titleColor: CATEGORY_TITLE_COLOR[slug] ?? CATEGORY_TITLE_DEFAULT_COLOR,
  };
}
