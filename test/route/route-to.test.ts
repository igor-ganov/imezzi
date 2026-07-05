import { describe, expect, test } from 'bun:test';
import { itineraryBadges } from '../../src/lib/route/itinerary-badges.ts';
import { routeTo } from '../../src/lib/route/route-to.ts';
import type { Itinerary, Leg } from '../../src/lib/route/types.ts';
import { appState } from '../../src/lib/store/app-state.ts';

const leg = (mode: string, line: string): Leg => ({
  mode,
  line,
  headsign: '',
  from: { name: 'A', lat: 44.4, lon: 8.9 },
  to: { name: 'B', lat: 44.41, lon: 8.91 },
  startTime: '2026-07-05T10:00:00Z',
  endTime: '2026-07-05T10:10:00Z',
  durationSec: 600,
  geometry: [],
  approximated: false,
  intermediateStops: [],
});

describe('routeTo — the single route-here entry point', () => {
  test('sets the destination, closes sheets, opens the planner', () => {
    appState.activeStopId.set('1234');
    appState.pickMode.set('destination');
    routeTo({ name: 'Brin', lat: 44.4245, lon: 8.8997 });
    expect(appState.destination.get()?.name).toBe('Brin');
    expect(appState.activeStopId.get()).toBeUndefined();
    expect(appState.activeCivic.get()).toBeUndefined();
    expect(appState.pickMode.get()).toBeUndefined();
    expect(appState.plannerOpen.get()).toBe(true);
    // The store is a module-level singleton shared across test files
    // in one bun run — leave it as found.
    appState.destination.set(undefined);
    appState.plannerOpen.set(false);
  });
});

describe('itineraryBadges', () => {
  test('ordered transit lines, walks skipped', () => {
    const itinerary: Itinerary = {
      legs: [leg('walk', ''), leg('bus', '18'), leg('walk', ''), leg('metro', 'MM')],
      startTime: '',
      endTime: '',
      durationSec: 0,
      transfers: 1,
    };
    expect(itineraryBadges(itinerary)).toEqual([
      { line: '18', mode: 'bus' },
      { line: 'MM', mode: 'metro' },
    ]);
  });
});
