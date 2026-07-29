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

export const CATEGORY_DETAILS: Record<string, string[]> = {
  "atlas-stories": [
    "These stories trace how climate shifts, land-use change and management decisions are reshaping rangelands, and what that means for the communities and livestock that depend on them. Each one draws on local knowledge and open data to make long-term change visible.",
  ],
  "restoration-investments": [
    "Currently funded by Global Environment Facility, it is led by the International Livestock Research Institute (ILRI) and IUCN, with supporting partners UNCCD Rangelands Initiative and Business4Land, Global Landscapes Forum Rio Changemakers, the Rangelands Stewardship Council and other CGIAR centers.",
    "The Hub presents a portfolio of technically-sound rangeland restoration investment cases that have been developed with livestock producers and supporting stakeholders, with support from STELARR. All investment cases follow a set of guiding principles that consider and support transparent and accountable rangeland stewardship practices, social equity, evidenced metrics, high degree of animal welfare and clearly defined financial and environmental targets.",
    "Whilst also being a gateway to investment, the Hub also offers technical support for further investment case development, expertise on livestock and rangelands including optimizing environmental benefits and reducing costs, and impact monitoring and evaluation.",
  ],
  "restoration-champions": [
    "Meet the people and organizations turning rangeland restoration into daily practice: herders, cooperatives, scientists and local institutions protecting these landscapes and the livelihoods they support. Their work shows what stewardship looks like at scale.",
  ],
};

export const CATEGORY_CONTACTS: Record<string, { intro: string; email: string }> = {
  "restoration-investments": {
    intro:
      "If you are an investor looking to invest in rangeland restoration, or are a rangelands livestock producer wanting to develop an investment case, please contact Fiona Flintan, Investment Hub Lead, ILRI",
    email: "f.flintan@cgiar.org",
  },
};
