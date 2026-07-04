import { describe, expect, test } from 'bun:test';
import { modeColor } from '../../src/lib/map/mode-color.ts';
import { MODE_HUES } from '../../src/lib/map/mode-hues.ts';

describe('modeColor', () => {
  test('bus in light theme uses hue 208 at 38% lightness', () => {
    expect(modeColor('bus', 'light')).toBe('hsl(208 72% 38%)');
  });

  test('bus in dark theme lifts lightness to 62%', () => {
    expect(modeColor('bus', 'dark')).toBe('hsl(208 72% 62%)');
  });

  test('known modes use their own hue', () => {
    expect(modeColor('metro', 'light')).toBe('hsl(354 72% 38%)');
    expect(modeColor('funicular', 'dark')).toBe('hsl(276 72% 62%)');
    expect(modeColor('train', 'light')).toBe('hsl(152 72% 38%)');
    expect(modeColor('walk', 'dark')).toBe('hsl(35 72% 62%)');
    expect(modeColor('boat', 'light')).toBe('hsl(190 72% 38%)');
    expect(modeColor('lift', 'dark')).toBe('hsl(300 72% 62%)');
  });

  test('unknown mode falls back to the bus hue 208', () => {
    expect(modeColor('spaceship', 'light')).toBe('hsl(208 72% 38%)');
    expect(modeColor('', 'dark')).toBe('hsl(208 72% 62%)');
  });

  test('saturation is fixed at 72% for every mode and theme', () => {
    Object.keys(MODE_HUES).forEach((mode) => {
      expect(modeColor(mode, 'light')).toContain(' 72% ');
      expect(modeColor(mode, 'dark')).toContain(' 72% ');
    });
  });

  test('every known mode yields a well-formed hsl() string', () => {
    const hsl = /^hsl\(\d{1,3} 72% \d{2}%\)$/;
    Object.keys(MODE_HUES).forEach((mode) => {
      expect(modeColor(mode, 'light')).toMatch(hsl);
      expect(modeColor(mode, 'dark')).toMatch(hsl);
    });
  });

  test('light and dark colours differ only in lightness', () => {
    Object.keys(MODE_HUES).forEach((mode) => {
      const light = modeColor(mode, 'light');
      const dark = modeColor(mode, 'dark');
      expect(light.replace('38%)', '')).toBe(dark.replace('62%)', ''));
    });
  });
});
