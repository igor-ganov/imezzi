import { describe, expect, test } from 'bun:test';
import { liteLayers } from '../../src/lib/map/lite-layers.ts';
import bright from '../../src/lib/map/styles/bright.json';
import dark from '../../src/lib/map/styles/dark.json';

type Layer = Record<string, unknown> & { readonly id: string };

describe('liteLayers — software-GL core tier', () => {
  test('cuts the bright style to a fraction, keeping the essentials', () => {
    const layers = bright.layers as unknown as readonly Layer[];
    const lite = liteLayers(layers);
    expect(lite.length).toBeLessThan(layers.length / 2);
    expect(lite.some((layer) => layer['type'] === 'background')).toBe(true);
    expect(lite.some((layer) => layer['source-layer'] === 'water')).toBe(true);
    expect(
      lite.some((layer) => layer['source-layer'] === 'transportation'),
    ).toBe(true);
    expect(lite.some((layer) => layer['source-layer'] === 'place')).toBe(true);
  });

  test('drops road casings, bridges, tunnels and POIs', () => {
    const lite = liteLayers(bright.layers as unknown as readonly Layer[]);
    expect(
      lite.some(
        (layer) =>
          layer['source-layer'] === 'transportation' &&
          /casing|bridge|tunnel/.test(layer.id),
      ),
    ).toBe(false);
    expect(lite.some((layer) => layer['source-layer'] === 'poi')).toBe(false);
  });

  test('works on the dark style too', () => {
    const layers = dark.layers as unknown as readonly Layer[];
    const lite = liteLayers(layers);
    expect(lite.length).toBeGreaterThan(10);
    expect(lite.length).toBeLessThan(layers.length);
  });
});
