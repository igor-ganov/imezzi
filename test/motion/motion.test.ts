import { describe, expect, test } from 'bun:test';
import {
  motionStep,
  type FleetMotion,
  type MotionTarget,
} from '../../src/lib/fleet/fleet-motion.ts';
import { staleFactor } from '../../src/lib/motion/stale-factor.ts';

const target = (over: Partial<MotionTarget>): MotionTarget => ({
  id: 'bus:09001',
  templateKey: '1#0',
  targetMoment: 300,
  ageSeconds: 0,
  ...over,
});

const at = (moment: number, templateKey = '1#0'): FleetMotion =>
  new Map([['bus:09001', { templateKey, moment }]]);

describe('staleFactor', () => {
  test('fresh full, aging linear, stale frozen', () => {
    expect(staleFactor(0)).toBe(1);
    expect(staleFactor(45)).toBe(1);
    expect(staleFactor(82.5)).toBeCloseTo(0.5);
    expect(staleFactor(120)).toBe(0);
  });
});

describe('motionStep — timeline-space chase', () => {
  test('new ids adopt their target moment directly', () => {
    const next = motionStep(new Map(), [target({})], 0.016);
    expect(next.get('bus:09001')?.moment).toBe(300);
  });

  test('ids missing from the targets are dropped', () => {
    expect(motionStep(at(100), [], 0.016).size).toBe(0);
  });

  test('the displayed moment NEVER moves backward', () => {
    // Target regressed below the displayed moment (prediction noise):
    // the marker holds instead of driving back down the street.
    const next = motionStep(at(200), [target({ targetMoment: 120 })], 0.5);
    expect(next.get('bus:09001')?.moment).toBe(200);
  });

  test('catch-up is capped — a big gap cannot be crossed in a frame', () => {
    // 900 s behind; one 0.1 s frame may advance at most 6×dt = 0.6 s
    // of timeline. Kilometres-in-a-blink is impossible by contract.
    const next = motionStep(at(0), [target({ targetMoment: 900 })], 0.1);
    expect(next.get('bus:09001')?.moment ?? 0).toBeLessThanOrEqual(0.601);
    expect(next.get('bus:09001')?.moment ?? 0).toBeGreaterThan(0);
  });

  test('repeated frames converge on the target', () => {
    const goal = target({ targetMoment: 60 });
    const final = Array.from({ length: 400 }).reduce<FleetMotion>(
      (state) => motionStep(state, [goal], 0.25),
      at(0),
    );
    expect(final.get('bus:09001')?.moment ?? 0).toBeCloseTo(60, 0);
  });

  test('stale targets freeze the displayed moment', () => {
    const next = motionStep(
      at(100),
      [target({ targetMoment: 200, ageSeconds: 300 })],
      0.5,
    );
    expect(next.get('bus:09001')?.moment).toBe(100);
  });

  test('aging targets chase slower than fresh ones', () => {
    const fresh = motionStep(at(100), [target({ targetMoment: 130 })], 0.25);
    const aging = motionStep(
      at(100),
      [target({ targetMoment: 130, ageSeconds: 90 })],
      0.25,
    );
    const freshStep = (fresh.get('bus:09001')?.moment ?? 0) - 100;
    const agingStep = (aging.get('bus:09001')?.moment ?? 0) - 100;
    expect(agingStep).toBeGreaterThan(0);
    expect(agingStep).toBeLessThan(freshStep);
  });

  test('a direction change adopts the new moment immediately', () => {
    const next = motionStep(
      at(280, '1#0'),
      [target({ templateKey: '1#1', targetMoment: 15 })],
      0.016,
    );
    expect(next.get('bus:09001')).toEqual({ templateKey: '1#1', moment: 15 });
  });
});
