import { describe, expect, test } from 'bun:test';
import { pushTick, type TickEntry } from '../../worker/fleet-hub/tick-log.ts';

const entry = (over: Partial<TickEntry>): Omit<TickEntry, 'anomaly'> => ({
  t: 1000,
  stops: 45,
  sightings: 120,
  vehicles: 60,
  ms: 900,
  sockets: 2,
  errors: 0,
  wrapped: 0,
  hot: 5,
  ...over,
});

describe('pushTick — hub sweep telemetry', () => {
  test('healthy ticks carry no anomaly stamp', () => {
    const log = pushTick([], entry({}));
    expect(log.length).toBe(1);
    expect(log[0]?.anomaly).toBeUndefined();
  });

  test('polled stops with zero parsed rows stamp "empty"', () => {
    expect(pushTick([], entry({ sightings: 0, vehicles: 0 }))[0]?.anomaly).toBe(
      'empty',
    );
  });

  test('an idle-plan tick (no stops) is not an anomaly', () => {
    const log = pushTick([], entry({ stops: 0, sightings: 0, vehicles: 0 }));
    expect(log[0]?.anomaly).toBeUndefined();
  });

  test('majority upstream failures stamp "errors"', () => {
    expect(pushTick([], entry({ errors: 30, sightings: 40 }))[0]?.anomaly).toBe(
      'errors',
    );
  });

  test('a slow sweep stamps "slow"', () => {
    expect(pushTick([], entry({ ms: 9000 }))[0]?.anomaly).toBe('slow');
  });

  test('a fleet collapse versus the previous tick stamps the drop', () => {
    const previous = pushTick([], entry({ vehicles: 100 }));
    const log = pushTick(previous, entry({ vehicles: 10, sightings: 20 }));
    expect(log[1]?.anomaly).toBe('vehicle-drop');
  });

  test('a small fleet fluctuating is not a drop', () => {
    const previous = pushTick([], entry({ vehicles: 4 }));
    const log = pushTick(previous, entry({ vehicles: 1, sightings: 2 }));
    expect(log[1]?.anomaly).toBeUndefined();
  });

  test('the ring is capped', () => {
    const log = Array.from({ length: 350 }).reduce<readonly TickEntry[]>(
      (acc, _, i) => pushTick(acc, entry({ t: i })),
      [],
    );
    expect(log.length).toBe(300);
    expect(log[0]?.t).toBe(50);
  });
});
