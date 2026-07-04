import type { Map as MapLibre } from 'maplibre-gl';
import { branch } from '../../lib/branch.ts';

const MAJOR = /motorway|trunk|primary|secondary/;
const CASING = /casing|outline/;

const colorFor = (id: string): string =>
  ({
    casing: 'hsl(215 25% 16%)',
    major: 'hsl(215 14% 38%)',
    minor: 'hsl(215 12% 27%)',
  })[
    { true: 'casing', false: { true: 'major', false: 'minor' }[`${MAJOR.test(id)}`] }[
      `${CASING.test(id)}`
    ] ?? 'minor'
  ] ?? 'hsl(215 12% 27%)';

/**
 * The OpenFreeMap dark style draws roads nearly black-on-black —
 * unusable for a transit map. Lift every transportation line layer
 * to a readable slate, keeping majors brighter than side streets.
 */
export const brightenDarkRoads = (
  map: MapLibre,
  theme: 'light' | 'dark',
): void =>
  branch(theme === 'dark')(
    () =>
      (map.getStyle()?.layers ?? [])
        .filter(
          (layer) =>
            layer.type === 'line' &&
            'source-layer' in layer &&
            layer['source-layer'] === 'transportation',
        )
        .forEach((layer) =>
          map.setPaintProperty(layer.id, 'line-color', colorFor(layer.id)),
        ),
    () => undefined,
  );
