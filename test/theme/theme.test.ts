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
    expect(nextPref('')).toBe('light');
  });

  test('three steps return to the starting pref', () => {
    expect(nextPref(nextPref(nextPref('light')))).toBe('light');
    expect(nextPref(nextPref(nextPref('dark')))).toBe('dark');
    expect(nextPref(nextPref(nextPref('system')))).toBe('system');
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

  test('unknown pref falls back to the system setting', () => {
    expect(resolveTheme('junk', true)).toBe('dark');
    expect(resolveTheme('junk', false)).toBe('light');
    expect(resolveTheme('', true)).toBe('dark');
  });

  test('fixed prefs echo themselves regardless of system', () => {
    expect(resolveTheme('light', false)).toBe('light');
    expect(resolveTheme('dark', true)).toBe('dark');
  });
});
