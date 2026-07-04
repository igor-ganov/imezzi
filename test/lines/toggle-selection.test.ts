import { describe, expect, test } from 'bun:test';
import { toggleSelection } from '../../src/lib/lines/toggle-selection.ts';

describe('toggleSelection', () => {
  test('adds an absent key', () => {
    expect(toggleSelection(new Set(['a']), 'b')).toEqual(new Set(['a', 'b']));
  });

  test('removes a present key', () => {
    expect(toggleSelection(new Set(['a', 'b']), 'b')).toEqual(new Set(['a']));
  });

  test('adds to an empty selection', () => {
    expect(toggleSelection(new Set(), 'a')).toEqual(new Set(['a']));
  });

  test('removing the only key empties the selection', () => {
    expect(toggleSelection(new Set(['a']), 'a')).toEqual(new Set());
  });

  test('does not mutate the input set', () => {
    const input = new Set(['a', 'b']);
    toggleSelection(input, 'b');
    toggleSelection(input, 'c');
    expect(input).toEqual(new Set(['a', 'b']));
  });

  test('returns a new set instance', () => {
    const input = new Set(['a']);
    expect(toggleSelection(input, 'b')).not.toBe(input);
  });

  test('toggling twice restores the original membership', () => {
    const once = toggleSelection(new Set(['a']), 'b');
    expect(toggleSelection(once, 'b')).toEqual(new Set(['a']));
  });
});
