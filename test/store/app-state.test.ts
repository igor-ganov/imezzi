import { describe, expect, test } from 'bun:test';
import { appState } from '../../src/lib/store/app-state.ts';

describe('appState', () => {
  test('every slice is a signal with get/set/subscribe', () => {
    Object.values(appState).forEach((slice) => {
      expect(typeof slice.get).toBe('function');
      expect(typeof slice.set).toBe('function');
      expect(typeof slice.subscribe).toBe('function');
    });
  });

  test('selectedLines starts as an empty set', () => {
    expect(appState.selectedLines.get().size).toBe(0);
  });

  test('optional slices start undefined', () => {
    expect(appState.activeStopId.get()).toBeUndefined();
    expect(appState.activeCivic.get()).toBeUndefined();
    expect(appState.searchPin.get()).toBeUndefined();
    expect(appState.itinerary.get()).toBeUndefined();
    expect(appState.origin.get()).toBeUndefined();
    expect(appState.destination.get()).toBeUndefined();
    expect(appState.pickMode.get()).toBeUndefined();
    expect(appState.focusLeg.get()).toBeUndefined();
  });

  test('collection slices start empty', () => {
    expect(appState.itineraries.get()).toEqual([]);
    expect(appState.liveSnapshots.get()).toEqual([]);
  });

  test('scalar slices start with documented defaults', () => {
    expect(appState.planning.get()).toBe(false);
    expect(appState.lastLiveUpdate.get()).toBe(0);
    expect(appState.theme.get()).toBe('light');
  });

  test('setting selectedLines notifies subscribers with the new set', () => {
    const received: ReadonlySet<string>[] = [];
    const unsubscribe = appState.selectedLines.subscribe((value) => {
      received.push(value);
    });
    const next: ReadonlySet<string> = new Set(['1', '35']);
    appState.selectedLines.set(next);
    expect(received).toHaveLength(1);
    expect(received[0]).toBe(next);
    expect(appState.selectedLines.get()).toBe(next);
    unsubscribe();
    appState.selectedLines.set(new Set());
    expect(received).toHaveLength(1);
    expect(appState.selectedLines.get().size).toBe(0);
  });
});
