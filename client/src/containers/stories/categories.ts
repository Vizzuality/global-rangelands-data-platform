export const CATEGORY_ORDER: string[] = [
  "atlas-stories",
  "restoration-investments",
  "restoration-champions",
];

export const STORY_CATEGORY_LABELS: Record<string, string> = {
  "atlas-stories": "Atlas Stories",
  "restoration-investments": "Restoration Investments",
  "restoration-champions": "Restoration Champions",
};

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

export const CATEGORY_DETAILS: Record<string, string> = {
  "atlas-stories":
    "These stories trace how climate shifts, land-use change and management decisions are reshaping rangelands, and what that means for the communities and livestock that depend on them. Each one draws on local knowledge and open data to make long-term change visible.",
  "restoration-investments":
    "Every investment case is developed with livestock producers and their partners, following shared principles of transparent stewardship, social equity, animal welfare and measurable environmental returns — forming a portfolio that connects restoration on the ground with the finance to sustain it.",
  "restoration-champions":
    "Meet the people and organizations turning rangeland restoration into daily practice: herders, cooperatives, scientists and local institutions protecting these landscapes and the livelihoods they support. Their work shows what stewardship looks like at scale.",
};
