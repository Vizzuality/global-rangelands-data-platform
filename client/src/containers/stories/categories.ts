export const CATEGORY_ORDER: string[] = [
  "atlas-stories",
  "restoration-investments",
  "restoration-champions",
];

export const STORY_CARD_VARIANTS: Record<string, string> = {
  "atlas-stories": "bg-brown-dark text-white",
  "restoration-investments": "bg-orange-bright text-brown-dark",
  "restoration-champions": "bg-green-light text-white",
};
export const STORY_CARD_DEFAULT_VARIANT = "bg-brown-dark text-white";

/** Card variant for the standalone landing/detail pages (Figma node 5071:76087) — always white, unlike the map-sidebar's category-colored cards. */
export const STORY_CARD_LANDING_VARIANT = "bg-white text-green-dark";

export const CATEGORY_TITLE_COLOR: Record<string, string> = {
  "atlas-stories": "text-brown-dark",
  "restoration-investments": "text-brown-dark",
  "restoration-champions": "text-green-light",
};
export const CATEGORY_TITLE_DEFAULT_COLOR = "text-brown-dark";

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "atlas-stories":
    "The impact of changes in rangelands on local communities, their livestock, and natural resources.",
  "restoration-investments":
    "The STELARR Rangeland Restoration Investment Hub is an investment matchmaking platform connecting locally-led investment cases with finance, accompanied by capacity building and technical support.",
  "restoration-champions":
    "People and organizations leading rangeland restoration and protecting these landscapes and the communities they sustain.",
};
