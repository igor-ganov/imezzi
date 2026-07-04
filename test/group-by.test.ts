import { describe, expect, test } from 'bun:test';
import { groupBy } from '../src/lib/group-by.ts';

describe('groupBy', () => {
  test('groups items by computed key', () => {
    const result = groupBy([1, 2, 3, 4, 5], (n) => n % 2);
    expect(result.get(1)).toEqual([1, 3, 5]);
    expect(result.get(0)).toEqual([2, 4]);
  });

  test('empty input yields an empty map', () => {
    const result = groupBy([], () => 'k');
    expect(result.size).toBe(0);
  });

  test('single item yields a single one-element group', () => {
    const result = groupBy(['a'], (s) => s.length);
    expect(result.size).toBe(1);
    expect(result.get(1)).toEqual(['a']);
  });

  test('all items under the same key form one group in input order', () => {
    const result = groupBy([3, 1, 2], () => 'same');
    expect(result.size).toBe(1);
    expect(result.get('same')).toEqual([3, 1, 2]);
  });

  test('keys keep first-seen insertion order', () => {
    const result = groupBy(['bb', 'a', 'cc', 'd'], (s) => s.length);
    expect([...result.keys()]).toEqual([2, 1]);
  });

  test('preserves original order inside each group', () => {
    const items = [
      { id: 'x', group: 'g1' },
      { id: 'y', group: 'g2' },
      { id: 'z', group: 'g1' },
    ];
    const result = groupBy(items, (item) => item.group);
    expect(result.get('g1')?.map((item) => item.id)).toEqual(['x', 'z']);
    expect(result.get('g2')?.map((item) => item.id)).toEqual(['y']);
  });

  test('every input item appears in exactly one group', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const result = groupBy(items, (n) => n % 3);
    const total = [...result.values()].reduce((sum, group) => sum + group.length, 0);
    expect(total).toBe(items.length);
  });

  test('missing key lookup returns undefined', () => {
    const result = groupBy([1, 2], (n) => n);
    expect(result.get(99)).toBeUndefined();
  });

  test('object keys are compared by reference', () => {
    const keyA = { tag: 'a' };
    const keyB = { tag: 'a' };
    const result = groupBy([1, 2], (n) => [keyA, keyB][n - 1] ?? keyA);
    expect(result.size).toBe(2);
    expect(result.get(keyA)).toEqual([1]);
    expect(result.get(keyB)).toEqual([2]);
  });

  test('NaN keys collapse into one group (SameValueZero)', () => {
    const result = groupBy([1, 2], () => Number.NaN);
    expect(result.size).toBe(1);
    expect(result.get(Number.NaN)).toEqual([1, 2]);
  });

  test('does not mutate the input array', () => {
    const items = [1, 2, 3];
    groupBy(items, (n) => n % 2);
    expect(items).toEqual([1, 2, 3]);
  });
});
