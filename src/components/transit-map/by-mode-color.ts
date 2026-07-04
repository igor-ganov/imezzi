import type { ExpressionSpecification } from 'maplibre-gl';
import { modeColor } from '../../lib/map/mode-color.ts';

/** MapLibre match expression: feature `mode` → theme paint colour. */
export const byModeColor = (
  theme: 'light' | 'dark',
): ExpressionSpecification => [
  'match',
  ['get', 'mode'],
  'bus',
  modeColor('bus', theme),
  'metro',
  modeColor('metro', theme),
  'funicular',
  modeColor('funicular', theme),
  'lift',
  modeColor('lift', theme),
  'train',
  modeColor('train', theme),
  'boat',
  modeColor('boat', theme),
  'walk',
  modeColor('walk', theme),
  modeColor('bus', theme),
];
