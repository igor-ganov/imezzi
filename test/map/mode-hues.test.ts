import { describe, expect, test } from 'bun:test';
import { MODE_HUES } from '../../src/lib/map/mode-hues.ts';

describe('MODE_HUES', () => {
  test('defines a hue for each transit mode', () => {
    expect(Object.keys(MODE_HUES).sort()).toEqual(
      ['boat', 'bus', 'funicular', 'lift', 'metro', 'train', 'walk'].sort(),
    );
  });

  test('maps each mode to its design hue', () => {
    expect(MODE_HUES['bus']).toBe(208);
    expect(MODE_HUES['metro']).toBe(354);
    expect(MODE_HUES['funicular']).toBe(276);
    expect(MODE_HUES['lift']).toBe(300);
    expect(MODE_HUES['train']).toBe(152);
    expect(MODE_HUES['boat']).toBe(190);
    expect(MODE_HUES['walk']).toBe(35);
  });

  test('all hues are valid degrees in [0, 360)', () => {
    Object.values(MODE_HUES).forEach((hue) => {
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
      expect(Number.isInteger(hue)).toBe(true);
    });
  });

  test('hues are pairwise distinct', () => {
    const values = Object.values(MODE_HUES);
    expect(new Set(values).size).toBe(values.length);
  });

  test('unknown mode has no hue', () => {
    expect(MODE_HUES['spaceship']).toBeUndefined();
  });
});
