import { retimeSpread } from './retime-spread.ts';
import type { BusDirectionTemplate } from './types.ts';

const FALLBACK_SECONDS = 30;

/**
 * Make template offsets STRICTLY increasing. AMT's GTFS rounds
 * stop_times to whole minutes, so ~26% of adjacent stops share an
 * offset — an infinite-speed segment that teleported markers by its
 * full length the instant the moment crossed it (the observed
 * crawl-then-jump jerkiness). Flat runs are re-timed between their
 * monotonic anchors proportionally to the inter-stop distances; a
 * flat tail gets a fallback pace.
 */
export const retimeTemplate = (
  template: BusDirectionTemplate,
  coords: ReadonlyMap<string, readonly [number, number]>,
): BusDirectionTemplate => {
  const out = [...template.offsets];
  const anchors = out.reduce<number[]>(
    (acc, offset, index) =>
      ({ true: [...acc, index], false: acc }[
        `${index === 0 || offset > (out[acc[acc.length - 1] ?? 0] ?? 0)}`
      ] ?? acc),
    [],
  );
  anchors
    .slice(1)
    .map((anchor, i) => ({ from: anchors[i] ?? 0, to: anchor }))
    .filter(({ from, to }) => to - from > 1)
    .forEach(({ from, to }) =>
      retimeSpread(template.stops, coords, out, from, to, out[to] ?? 0),
    );
  const last = anchors[anchors.length - 1] ?? 0;
  [last]
    .filter((anchor) => anchor < out.length - 1)
    .forEach((anchor) =>
      retimeSpread(
        template.stops,
        coords,
        out,
        anchor,
        out.length - 1,
        (out[anchor] ?? 0) + FALLBACK_SECONDS * (out.length - 1 - anchor),
      ),
    );
  return { ...template, offsets: out };
};
