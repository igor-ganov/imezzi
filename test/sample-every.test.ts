import { describe, expect, test } from 'bun:test';
import { sampleEvery } from '../src/lib/sample-every.ts';

const range = (length: number): readonly number[] =>
  Array.from({ length }, (_, index) => index);

describe('sampleEvery', () => {
  test('returns all items when limit equals length', () => {
    expect(sampleEvery([1, 2, 3], 3)).toEqual([1, 2, 3]);
  });

  test('returns all items when limit exceeds length', () => {
    expect(sampleEvery([1, 2, 3], 100)).toEqual([1, 2, 3]);
  });

  test('empty input yields an empty array', () => {
    expect(sampleEvery([], 5)).toEqual([]);
    expect(sampleEvery([], 0)).toEqual([]);
  });

  test('limit 0 degrades to keeping only the first element', () => {
    expect(sampleEvery([1, 2, 3, 4, 5], 0)).toEqual([1]);
  });

  test('limit 1 keeps only the first element', () => {
    expect(sampleEvery([1, 2, 3, 4, 5], 1)).toEqual([1]);
  });

  test('always keeps the first element', () => {
    [1, 2, 3, 7, 100].forEach((limit) => {
      expect(sampleEvery(['first', 'b', 'c', 'd', 'e'], limit)[0]).toBe('first');
    });
  });

  test('samples with even spacing (10 items, limit 5 → every 2nd)', () => {
    expect(sampleEvery(range(10), 5)).toEqual([0, 2, 4, 6, 8]);
  });

  test('rounds the step up (10 items, limit 3 → every 4th)', () => {
    expect(sampleEvery(range(10), 3)).toEqual([0, 4, 8]);
  });

  test('7 items with limit 3 samples indexes 0, 3, 6', () => {
    expect(sampleEvery(range(7), 3)).toEqual([0, 3, 6]);
  });

  test('never returns more than limit items', () => {
    const cases: readonly (readonly [number, number])[] = [
      [5, 2],
      [6, 4],
      [9, 4],
      [100, 7],
      [101, 10],
      [3, 1],
    ];
    cases.forEach(([length, limit]) => {
      expect(sampleEvery(range(length), limit).length).toBeLessThanOrEqual(limit);
    });
  });

  test('sampled items keep their relative order', () => {
    const sampled = sampleEvery(range(50), 6);
    const sorted = [...sampled].sort((a, b) => a - b);
    expect(sampled).toEqual(sorted);
  });

  test('sampled items are a subset of the input', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    sampleEvery(items, 3).forEach((item) => {
      expect(items).toContain(item);
    });
  });

  test('does not mutate the input array', () => {
    const items = [1, 2, 3, 4];
    sampleEvery(items, 2);
    expect(items).toEqual([1, 2, 3, 4]);
  });
});
