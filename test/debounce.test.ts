import { describe, expect, test } from 'bun:test';
import { debounce } from '../src/lib/debounce.ts';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('debounce', () => {
  test('does not invoke the function synchronously', () => {
    const calls: number[] = [];
    const run = debounce(20, (n: number) => {
      calls.push(n);
    });
    run(1);
    expect(calls).toEqual([]);
  });

  test('does not fire before the delay has elapsed', async () => {
    const calls: number[] = [];
    const run = debounce(100, (n: number) => {
      calls.push(n);
    });
    run(1);
    await wait(15);
    expect(calls).toEqual([]);
    await wait(150);
    expect(calls).toEqual([1]);
  });

  test('a burst of calls fires exactly once with the last args (trailing wins)', async () => {
    const calls: number[] = [];
    const run = debounce(20, (n: number) => {
      calls.push(n);
    });
    run(1);
    run(2);
    run(3);
    await wait(60);
    expect(calls).toEqual([3]);
  });

  test('passes multiple arguments through unchanged', async () => {
    const calls: (readonly [string, number, boolean])[] = [];
    const run = debounce(20, (s: string, n: number, b: boolean) => {
      calls.push([s, n, b]);
    });
    run('a', 1, false);
    run('b', 2, true);
    await wait(60);
    expect(calls).toEqual([['b', 2, true]]);
  });

  test('a call inside the window resets the timer', async () => {
    const calls: number[] = [];
    const run = debounce(80, (n: number) => {
      calls.push(n);
    });
    run(1);
    await wait(50);
    run(2);
    await wait(20);
    expect(calls).toEqual([]);
    await wait(150);
    expect(calls).toEqual([2]);
  });

  test('separate quiet bursts each fire once', async () => {
    const calls: number[] = [];
    const run = debounce(20, (n: number) => {
      calls.push(n);
    });
    run(1);
    await wait(60);
    run(2);
    await wait(60);
    expect(calls).toEqual([1, 2]);
  });

  test('two independent debounced functions do not interfere', async () => {
    const calls: string[] = [];
    const first = debounce(20, () => {
      calls.push('first');
    });
    const second = debounce(20, () => {
      calls.push('second');
    });
    first();
    second();
    await wait(60);
    expect([...calls].sort()).toEqual(['first', 'second']);
  });

  test('works with zero-argument callbacks', async () => {
    const calls: string[] = [];
    const run = debounce(20, () => {
      calls.push('done');
    });
    run();
    await wait(60);
    expect(calls).toEqual(['done']);
  });
});
