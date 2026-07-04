/**
 * Transit-mode hue tokens — single source shared by CSS custom
 * properties (global.css) and MapLibre paint expressions (design §3).
 */
export const MODE_HUES: Readonly<Record<string, number>> = {
  bus: 208,
  metro: 354,
  funicular: 276,
  lift: 300,
  train: 152,
  boat: 190,
  walk: 35,
};
