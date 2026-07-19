import { describe, expect, test } from 'bun:test';
import { byModeIcon } from '../../src/components/transit-map/by-mode-icon.ts';

const expr: readonly unknown[] = byModeIcon();
// In a MapLibre `match`, the icon for a mode is the element right
// after the mode literal; the final element is the fallback.
const iconFor = (mode: string): unknown => expr[expr.indexOf(mode) + 1];

describe('byModeIcon', () => {
  test('each mode maps to its type sprite', () => {
    expect(iconFor('metro')).toBe('rail_metro_11');
    expect(iconFor('train')).toBe('railway_11');
    expect(iconFor('funicular')).toBe('rail_light_11');
    expect(iconFor('lift')).toBe('entrance_11');
    expect(iconFor('boat')).toBe('ferry_terminal_11');
  });

  test('the fallback is a rail symbol', () => {
    expect(expr[expr.length - 1]).toBe('railway_11');
  });
});
