import type { ExpressionSpecification } from 'maplibre-gl';

/**
 * MapLibre match: feature `mode` → POI sprite icon that names the
 * stop type, drawn in the same monochrome Maki set as the bus symbol
 * (metro / rail for the Casella train / light-rail for the funicular
 * & cremagliera / a door for the ascensori lifts / ferry for boats).
 */
export const byModeIcon = (): ExpressionSpecification => [
  'match',
  ['get', 'mode'],
  'metro',
  'rail_metro_11',
  'train',
  'railway_11',
  'funicular',
  'rail_light_11',
  'lift',
  'entrance_11',
  'boat',
  'ferry_terminal_11',
  'railway_11',
];
