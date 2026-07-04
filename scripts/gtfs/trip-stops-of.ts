import type { TripStop } from './group-directions.ts';

type Row = Readonly<Record<string, string>>;

/** Index stop_times rows by trip id. */
export const tripStopsOf = (
  stopTimes: readonly Row[],
): ReadonlyMap<string, readonly TripStop[]> => {
  const byTrip = new Map<string, TripStop[]>();
  stopTimes.forEach((row) => {
    const list = byTrip.get(row['trip_id'] ?? '') ?? [];
    list.push({
      stopId: row['stop_id'] ?? '',
      arrival: row['arrival_time'] ?? '0:0:0',
      sequence: Number(row['stop_sequence'] ?? '0'),
    });
    byTrip.set(row['trip_id'] ?? '', list);
  });
  return byTrip;
};
