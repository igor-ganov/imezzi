import { describe, expect, test } from 'bun:test';
import { nextSlice } from '../../worker/fleet-hub/rotation.ts';

const plan = Array.from({ length: 10 }, (_, i) => `s${i}`);

describe('nextSlice — the hub sweep rotation', () => {
  test('hot stops lead, the window fills the remaining budget', () => {
    const { slice, cursor } = nextSlice(plan, 0, ['hot1'], 4);
    expect(slice).toEqual(['hot1', 's0', 's1', 's2']);
    expect(cursor).toBe(3);
  });

  test('hot stops never push plan stops out of coverage', () => {
    // Cursor advances only by what was actually taken from the plan:
    // nothing is skipped, the full city still gets swept.
    const first = nextSlice(plan, 0, ['h1', 'h2'], 4);
    expect(first.slice).toEqual(['h1', 'h2', 's0', 's1']);
    const second = nextSlice(plan, first.cursor, [], 4);
    expect(second.slice).toEqual(['s2', 's3', 's4', 's5']);
  });

  test('the total slice is capped at the subrequest budget', () => {
    const hot = Array.from({ length: 9 }, (_, i) => `h${i}`);
    const { slice, cursor } = nextSlice(plan, 0, hot, 4);
    expect(slice.length).toBe(4);
    expect(cursor).toBe(0);
  });

  test('the cursor wraps around the plan', () => {
    const { cursor } = nextSlice(plan, 8, [], 4);
    expect(cursor).toBe(0);
  });

  test('an empty plan never divides by zero', () => {
    expect(nextSlice([], 0, [], 4)).toEqual({ slice: [], cursor: 0 });
  });
});
