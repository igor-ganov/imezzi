import { describe, expect, test } from 'bun:test';
import {
  carryTargets,
  type TargetCarry,
} from '../../src/lib/fleet/carry-targets.ts';
import type { FleetTarget } from '../../src/lib/fleet/fleet-target.ts';

const target = (id: string, over: Partial<FleetTarget> = {}): FleetTarget => ({
  id,
  label: '1',
  templateKey: '1#0',
  template: undefined,
  road: undefined,
  targetMoment: 100,
  ageSeconds: 5,
  anchor: [8.9, 44.1],
  dimmed: false,
  ...over,
});

const carryOf = (
  entries: readonly (readonly [string, FleetTarget, number])[],
): TargetCarry =>
  new Map(
    entries.map(([id, entry, builtAtSeconds]) => [
      id,
      { target: entry, builtAtSeconds },
    ]),
  );

describe('carryTargets — no blink, no re-adopt jump (regression)', () => {
  test('a vehicle missing from fresh data survives as a ghost', () => {
    const previous = carryOf([['bus:09001', target('bus:09001'), 1000]]);
    const { targets } = carryTargets(previous, [], 1030);
    expect(targets.length).toBe(1);
    expect(targets[0]?.id).toBe('bus:09001');
    // Its age grows by the time carried, so the stale factor brakes it.
    expect(targets[0]?.ageSeconds).toBe(35);
  });

  test('fresh data replaces the ghost seamlessly', () => {
    const previous = carryOf([['bus:09001', target('bus:09001'), 1000]]);
    const fresh = target('bus:09001', { targetMoment: 160, ageSeconds: 0 });
    const { targets } = carryTargets(previous, [fresh], 1030);
    expect(targets).toEqual([fresh]);
  });

  test('ghosts expire after the grace period', () => {
    const previous = carryOf([['bus:09001', target('bus:09001'), 1000]]);
    expect(carryTargets(previous, [], 1061).targets).toEqual([]);
  });

  test('a ghost keeps its target moment (frozen, not re-adopted)', () => {
    const previous = carryOf([
      ['bus:09001', target('bus:09001', { targetMoment: 240 }), 1000],
    ]);
    const { targets } = carryTargets(previous, [], 1040);
    expect(targets[0]?.targetMoment).toBe(240);
    expect(targets[0]?.templateKey).toBe('1#0');
  });

  test('ghost lifetimes chain across successive frames', () => {
    const step1 = carryTargets(
      carryOf([['bus:09001', target('bus:09001'), 1000]]),
      [],
      1020,
    );
    const step2 = carryTargets(step1.carry, [], 1050);
    expect(step2.targets.length).toBe(1);
    expect(step2.targets[0]?.ageSeconds).toBe(55);
    const step3 = carryTargets(step2.carry, [], 1070);
    expect(step3.targets).toEqual([]);
  });
});
