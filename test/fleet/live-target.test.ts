import { describe, expect, test } from 'bun:test';
import type { FleetTarget } from '../../src/lib/fleet/fleet-target.ts';
import { liveGoal } from '../../src/lib/fleet/live-target.ts';

const target = (over: Partial<FleetTarget>): FleetTarget => ({
  id: 'bus:09001',
  label: '1',
  templateKey: '1#0',
  template: { stops: ['A', 'B', 'C'], offsets: [0, 120, 300], lastStopName: 'C' },
  road: undefined,
  targetMoment: 100,
  ageSeconds: 2,
  builtAtMs: 10000,
  anchor: [8.9, 44.1],
  dimmed: false,
  ...over,
});

describe('liveGoal — the target moves between data portions', () => {
  test('the goal advances at schedule speed in real time', () => {
    // 6 s after the portion the goal is 6 s further down the trip —
    // the render chase follows CONTINUOUS motion, never a frozen
    // point (the observed sprint-and-stand jerkiness).
    expect(liveGoal(target({}), 16000)).toEqual({
      moment: 106,
      ageSeconds: 8,
    });
  });

  test('the goal clamps at the trip end', () => {
    expect(liveGoal(target({ targetMoment: 295 }), 30000).moment).toBe(300);
  });

  test('age keeps growing past the clamp (stale factor brakes it)', () => {
    expect(liveGoal(target({}), 130000).ageSeconds).toBe(122);
  });

  test('clock skew never moves the goal backwards', () => {
    expect(liveGoal(target({}), 5000)).toEqual({ moment: 100, ageSeconds: 2 });
  });

  test('no template — the goal holds its computed moment', () => {
    const goal = liveGoal(target({ template: undefined }), 16000);
    expect(goal.moment).toBe(100);
  });
});
