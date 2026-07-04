import { describe, expect, test } from 'bun:test';
import { signal } from '../../src/lib/store/signal.ts';

describe('signal', () => {
  test('get returns the initial value', () => {
    expect(signal(42).get()).toBe(42);
  });

  test('holds reference values without copying', () => {
    const initial = { a: 1 };
    expect(signal(initial).get()).toBe(initial);
  });

  test('set updates the value returned by get', () => {
    const s = signal('old');
    s.set('new');
    expect(s.get()).toBe('new');
  });

  test('supports undefined as initial and set value', () => {
    const s = signal<number | undefined>(undefined);
    expect(s.get()).toBeUndefined();
    s.set(5);
    expect(s.get()).toBe(5);
    s.set(undefined);
    expect(s.get()).toBeUndefined();
  });

  test('subscriber is called with the new value on set', () => {
    const s = signal(0);
    const received: number[] = [];
    s.subscribe((value) => {
      received.push(value);
    });
    s.set(7);
    expect(received).toEqual([7]);
  });

  test('subscriber is not called at subscribe time', () => {
    const s = signal(1);
    const received: number[] = [];
    s.subscribe((value) => {
      received.push(value);
    });
    expect(received).toEqual([]);
  });

  test('all subscribers are notified on each set', () => {
    const s = signal('a');
    const first: string[] = [];
    const second: string[] = [];
    s.subscribe((value) => {
      first.push(value);
    });
    s.subscribe((value) => {
      second.push(value);
    });
    s.set('b');
    s.set('c');
    expect(first).toEqual(['b', 'c']);
    expect(second).toEqual(['b', 'c']);
  });

  test('the value is updated before subscribers run', () => {
    const s = signal(0);
    const seen: number[] = [];
    s.subscribe(() => {
      seen.push(s.get());
    });
    s.set(9);
    expect(seen).toEqual([9]);
  });

  test('unsubscribe stops delivery to that subscriber only', () => {
    const s = signal(0);
    const kept: number[] = [];
    const dropped: number[] = [];
    s.subscribe((value) => {
      kept.push(value);
    });
    const unsubscribe = s.subscribe((value) => {
      dropped.push(value);
    });
    s.set(1);
    unsubscribe();
    s.set(2);
    expect(kept).toEqual([1, 2]);
    expect(dropped).toEqual([1]);
  });

  test('calling unsubscribe twice is harmless', () => {
    const s = signal(0);
    const received: number[] = [];
    const unsubscribe = s.subscribe((value) => {
      received.push(value);
    });
    unsubscribe();
    unsubscribe();
    s.set(1);
    expect(received).toEqual([]);
  });

  test('setting an identical value does not notify (Object.is)', () => {
    const s = signal(5);
    const received: number[] = [];
    s.subscribe((value) => {
      received.push(value);
    });
    s.set(5);
    expect(received).toEqual([]);
    s.set(6);
    expect(received).toEqual([6]);
  });

  test('a new object with equal shape still notifies', () => {
    const first = { a: 1 };
    const s = signal(first);
    const received: object[] = [];
    s.subscribe((value) => {
      received.push(value);
    });
    s.set({ a: 1 });
    expect(received.length).toBe(1);
  });

  test('the same listener function is registered once (Set semantics)', () => {
    const s = signal(0);
    const received: number[] = [];
    const listener = (value: number) => {
      received.push(value);
    };
    s.subscribe(listener);
    s.subscribe(listener);
    s.set(3);
    expect(received).toEqual([3]);
  });

  test('independent signals do not share state', () => {
    const a = signal(1);
    const b = signal(1);
    a.set(2);
    expect(a.get()).toBe(2);
    expect(b.get()).toBe(1);
  });
});
