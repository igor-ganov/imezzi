import { busContextOf } from '../../lib/data/bus-context-of.ts';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import { sampleEvery } from '../../lib/sample-every.ts';
import { inferBusVehicles } from '../../lib/vehicles/infer-bus-vehicles.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import { fetchStopArrivals } from './fetch-stop-arrivals.ts';

const STOPS_PER_LINE = 12;

/** Live vehicles for explicitly selected/itinerary bus lines. */
export const pollTargeted = async (
  lines: readonly UiLine[],
): Promise<readonly VehicleView[]> => {
  const perLine = await Promise.all(
    lines.map(async (line) => {
      const context = await busContextOf(line);
      const arrivals = await fetchStopArrivals(
        sampleEvery(context.monitoredStopIds, STOPS_PER_LINE),
      );
      return inferBusVehicles(context, arrivals, romeClock(new Date()).seconds);
    }),
  );
  return perLine.flat();
};
