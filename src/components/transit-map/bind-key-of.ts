import type { FleetTarget } from '../../lib/fleet/fleet-target.ts';

/**
 * The step meter's identity key. Anchored vehicles (no template —
 * a GTFS gap) hop between sighting stops: a legitimate data
 * re-binding, not a glide violation, so their key includes the
 * anchor and a hop reads as a re-bind.
 */
export const bindKeyOf = (
  target: FleetTarget | undefined,
  snaps: number,
): string => {
  const anchored = target?.template === undefined;
  // Road arrival re-projects a straight-line placement onto the
  // street once the line geometry lazy-loads — also a re-bind, and
  // so is every SNAP relocation (anomalous data correction).
  const road = { true: 'r1', false: 'r0' }[`${target?.road !== undefined}`];
  return `${target?.templateKey ?? ''}#${road}#s${snaps}${
    { true: `@${target?.anchor.join(',') ?? ''}`, false: '' }[`${anchored}`] ??
    ''
  }`;
};
