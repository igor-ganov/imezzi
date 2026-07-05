import { retimeTemplate } from './retime-template.ts';
import type { BusOffsets } from './types.ts';

/** Re-time every direction template of every line (see retimeTemplate). */
export const retimeOffsets = (
  offsets: BusOffsets,
  coords: ReadonlyMap<string, readonly [number, number]>,
): BusOffsets =>
  Object.fromEntries(
    Object.entries(offsets).map(([line, templates]) => [
      line,
      templates.map((template) => retimeTemplate(template, coords)),
    ]),
  );
