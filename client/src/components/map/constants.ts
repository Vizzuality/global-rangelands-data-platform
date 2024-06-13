export const DEFAULT_VIEW_STATE = {
  longitude: -3.2207287487196936,
  latitude: 43.29971784965869,
  zoom: 1.4968508510785945,
  pitch: 0,
  bearing: 0,
};

export const DEFAULT_BBOX: [number, number, number, number] = [
  -118.3665 * 1.1,
  1.1768 * 1.1,
  -53.9775 * 1.1,
  32.7186 * 1.1,
];

export const MAPBOX_STYLE = {
  dark: "mapbox://styles/grass2024/clvaofz0e00qi01qzfs5va44i",
  light: "mapbox://styles/grass2024/clvf7wk8i016201qu5fbjgrcv",
} as const;

export const mapStyleOptions = [
  {
    label: "Light",
    value: "light",
    icon: "/images/map-style/light.png",
  },
  {
    label: "Dark",
    value: "dark",
    icon: "/images/map-style/dark.png",
  },
];
