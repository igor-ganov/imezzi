import { describe, expect, test } from 'bun:test';
import fleetPlanIds from '../../worker/fleet-hub/fleet-plan.json';

/**
 * The hub's sweep plan is a committed static snapshot (an empty plan
 * silently kills the whole live fleet — see build-fleet-plan.ts). This
 * guards against a truncated, malformed, or accidentally-emptied
 * regeneration ever shipping.
 */
describe('bundled fleet plan', () => {
  test('covers the whole city (a stride-6 sweep is ~900 stops)', () => {
    expect(fleetPlanIds.length).toBeGreaterThan(500);
  });

  test('every entry is a valid AMT stop id', () => {
    expect(fleetPlanIds.every((id) => /^\d{1,6}$/.test(id))).toBe(true);
  });

  test('holds no duplicates', () => {
    expect(new Set(fleetPlanIds).size).toBe(fleetPlanIds.length);
  });
});
