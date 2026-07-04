import { describe, expect, test } from 'bun:test';
import { nextPref } from '../../src/lib/theme/next-pref.ts';
import { resolveTheme } from '../../src/lib/theme/resolve-theme.ts';

describe('nextPref', () => {
  test('cycles light → dark → system → light', () => {
    expect(nextPref('light')).toBe('dark');
    expect(nextPref('dark')).toBe('system');
    expect(nextPref('system')).toBe('light');
  });

  test('recovers from unknown value', () => {
    expect(nextPref('junk')).toBe('light');
  });
});

describe('resolveTheme', () => {
  test('fixed prefs ignore system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  test('system pref follows system setting', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });
});
