import type { Stop } from '../amt/types.ts';
import { sampleEvery } from '../sample-every.ts';

export interface Viewport {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
  readonly zoom: number;
}

/**
 * Monitored stops inside the viewport, rotated by poll cycle so
 * successive polls sweep different stops (live-map design §2).
 */
export const viewportStopIds = (
  stops: readonly Stop[],
  viewport: Viewport,
  cycle: number,
  limit: number,
): readonly string[] => {
  const visible = stops.filter(
    (stop) =>
      stop.monitored &&
      stop.lon >= viewport.west &&
      stop.lon <= viewport.east &&
      stop.lat >= viewport.south &&
      stop.lat <= viewport.north,
  );
  const offset = (cycle * limit) % Math.max(visible.length, 1);
  const rotated = [...visible.slice(offset), ...visible.slice(0, offset)];
  return sampleEvery(rotated, limit).map((stop) => stop.id);
};
