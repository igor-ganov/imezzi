import { describe, expect, test } from 'bun:test';
import { chunk } from '../../src/lib/chunk.ts';

describe('chunk', () => {
  test('splits into consecutive slices of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('a list within one batch stays whole', () => {
    expect(chunk(['a', 'b'], 40)).toEqual([['a', 'b']]);
  });

  test('empty input produces no batches', () => {
    expect(chunk([], 40)).toEqual([]);
  });

  test('a non-positive size degrades to size 1, never loops', () => {
    expect(chunk([1, 2], 0)).toEqual([[1], [2]]);
  });
});
