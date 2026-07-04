import { describe, expect, test } from 'bun:test';
import { poolMap } from '../src/lib/pool-map.ts';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('poolMap', () => {
  test('maps every item and preserves input order', async () => {
    const result = await poolMap([1, 2, 3], 3, async (n) => n * 2);
    expect(result).toEqual([2, 4, 6]);
  });

  test('empty input resolves to an empty array', async () => {
    const result = await poolMap([], 4, async (n: number) => n);
    expect(result).toEqual([]);
  });

  test('order is preserved even when later items resolve first', async () => {
    const delays: Readonly<Record<number, number>> = { 1: 25, 2: 5 };
    const result = await poolMap([1, 2], 2, (n) =>
      wait(delays[n] ?? 0).then(() => n),
    );
    expect(result).toEqual([1, 2]);
  });

  test('limit 1 runs items strictly sequentially', async () => {
    const events: string[] = [];
    const result = await poolMap([1, 2, 3], 1, async (n) => {
      events.push(`start ${n}`);
      await wait(5);
      events.push(`end ${n}`);
      return n * 10;
    });
    expect(result).toEqual([10, 20, 30]);
    expect(events).toEqual(['start 1', 'end 1', 'start 2', 'end 2', 'start 3', 'end 3']);
  });

  test('never exceeds the concurrency limit', async () => {
    const state = { active: 0, peak: 0 };
    await poolMap([1, 2, 3, 4, 5], 2, async (n) => {
      state.active += 1;
      state.peak = Math.max(state.peak, state.active);
      await wait(5);
      state.active -= 1;
      return n;
    });
    expect(state.peak).toBe(2);
  });

  test('limit greater than length runs all items in one concurrent chunk', async () => {
    const state = { active: 0, peak: 0 };
    const result = await poolMap([1, 2, 3], 10, async (n) => {
      state.active += 1;
      state.peak = Math.max(state.peak, state.active);
      await wait(5);
      state.active -= 1;
      return n;
    });
    expect(result).toEqual([1, 2, 3]);
    expect(state.peak).toBe(3);
  });

  test('a chunk starts only after the previous chunk fully settled', async () => {
    const completed: number[] = [];
    const seenAtStart: Record<number, readonly number[]> = {};
    await poolMap([1, 2, 3, 4], 2, async (n) => {
      seenAtStart[n] = [...completed];
      await wait(5);
      completed.push(n);
      return n;
    });
    expect(seenAtStart[1]).toEqual([]);
    expect(seenAtStart[2]).toEqual([]);
    expect([...(seenAtStart[3] ?? [])].sort()).toEqual([1, 2]);
    expect([...(seenAtStart[4] ?? [])].sort()).toEqual([1, 2]);
  });

  test('uneven division leaves a smaller trailing chunk', async () => {
    const state = { active: 0, peaks: [] as number[] };
    await poolMap([1, 2, 3, 4, 5], 2, async (n) => {
      state.active += 1;
      state.peaks.push(state.active);
      await wait(5);
      state.active -= 1;
      return n;
    });
    expect(state.peaks.at(-1)).toBe(1);
  });

  test('rejection of one item rejects the whole pool', async () => {
    const strategies: Readonly<Record<number, () => Promise<number>>> = {
      2: () => Promise.reject(new Error('boom')),
    };
    const fn = (n: number) => (strategies[n] ?? (() => Promise.resolve(n)))();
    await expect(poolMap([1, 2, 3], 3, fn)).rejects.toThrow('boom');
  });

  test('rejection in an early chunk prevents later chunks from starting', async () => {
    const started: number[] = [];
    const strategies: Readonly<Record<number, () => Promise<number>>> = {
      2: () => Promise.reject(new Error('early failure')),
    };
    const fn = (n: number) => {
      started.push(n);
      return (strategies[n] ?? (() => Promise.resolve(n)))();
    };
    await expect(poolMap([1, 2, 3, 4], 2, fn)).rejects.toThrow('early failure');
    expect(started).toEqual([1, 2]);
  });

  test('synchronous throw inside fn rejects the pool', async () => {
    const fn = (n: number): Promise<number> => {
      throw new Error(`sync ${n}`);
    };
    await expect(poolMap([1], 1, fn)).rejects.toThrow('sync 1');
  });

  test('single item with limit 1 resolves to a one-element array', async () => {
    const result = await poolMap(['only'], 1, async (s) => s.toUpperCase());
    expect(result).toEqual(['ONLY']);
  });
});
