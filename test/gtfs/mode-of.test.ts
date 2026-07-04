import { describe, expect, test } from 'bun:test';
import { modeOf } from '../../scripts/gtfs/mode-of.ts';

describe('modeOf', () => {
  test('maps every documented GTFS route_type', () => {
    expect(modeOf('1')).toBe('metro');
    expect(modeOf('2')).toBe('train');
    expect(modeOf('3')).toBe('bus');
    expect(modeOf('4')).toBe('boat');
    expect(modeOf('7')).toBe('funicular');
  });

  test('blank route_type means an AMT public elevator', () => {
    expect(modeOf('')).toBe('lift');
  });

  test('unknown route_types fall back to lift', () => {
    expect(modeOf('0')).toBe('lift');
    expect(modeOf('5')).toBe('lift');
    expect(modeOf('99')).toBe('lift');
  });
});
