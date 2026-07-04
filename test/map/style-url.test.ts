import { describe, expect, test } from 'bun:test';
import { styleUrl } from '../../src/lib/map/style-url.ts';

describe('styleUrl', () => {
  test('light theme maps to the liberty style', () => {
    expect(styleUrl('light')).toBe('https://tiles.openfreemap.org/styles/liberty');
  });

  test('dark theme maps to the dark style', () => {
    expect(styleUrl('dark')).toBe('https://tiles.openfreemap.org/styles/dark');
  });

  test('themes yield distinct urls', () => {
    expect(styleUrl('light')).not.toBe(styleUrl('dark'));
  });

  test('urls are https openfreemap endpoints (no api key)', () => {
    (['light', 'dark'] satisfies readonly ('light' | 'dark')[]).forEach((theme) => {
      const url = styleUrl(theme);
      expect(url.startsWith('https://tiles.openfreemap.org/styles/')).toBe(true);
      expect(url).not.toContain('?');
      expect(url).not.toContain('key');
    });
  });
});
