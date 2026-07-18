import type { Arrival } from '../../lib/amt/types.ts';
import { mergeBoardRows } from '../../lib/arrivals/merge-board-rows.ts';
import { scheduleBoardRows } from '../../lib/arrivals/schedule-board-rows.ts';
import { fetchJson } from '../../lib/api/fetch-json.ts';
import { branch } from '../../lib/branch.ts';
import { loadSchedule } from '../../lib/data/load-schedule.ts';
import { loadStops } from '../../lib/data/load-stops.ts';
import { stationName } from '../../lib/map/station-name.ts';
import { romeClock } from '../../lib/schedule/rome-clock.ts';
import type { StopSheetHost } from './host.ts';

const REFRESH_MS = 20000;

/** Imperative shell: board fetch loop for the active stop (AC-3.4). */
export const makeStopSheetController = (host: StopSheetHost) => {
  const state: { timer?: ReturnType<typeof setInterval> } = {};
  const refresh = async (): Promise<void> => {
    const id = host.stopId ?? '';
    const [stops, schedule] = await Promise.all([loadStops(), loadSchedule()]);
    const busStop = stops.find((stop) => stop.id === id);
    // Non-bus stations (funicular / lift / metro) are not SIMON stops —
    // hitting /api/arrivals for them returns *ERR* rows. They live only
    // in the GTFS timetable, so serve schedule rows and skip the fetch.
    const live = await branch(busStop !== undefined)(
      () =>
        fetchJson<readonly Arrival[]>(`/api/arrivals/${id}`).catch(
          () => undefined,
        ),
      () => Promise.resolve(undefined),
    );
    const clock = romeClock(new Date());
    const special = schedule.stops[id];
    host.stopName =
      busStop?.name ??
      [special?.name].filter((n): n is string => n !== undefined).map(stationName)[0] ??
      `Stop ${id}`;
    host.stale = busStop !== undefined && live === undefined;
    host.rows = mergeBoardRows(
      live ?? [],
      scheduleBoardRows(schedule, id, clock),
      clock.seconds,
      12,
    );
  };
  const onStopChange = (id: string | undefined): void => {
    host.stopId = id;
    host.rows = [];
    clearInterval(state.timer);
    branch(id !== undefined)(
      () => {
        state.timer = setInterval(() => void refresh(), REFRESH_MS);
        void refresh();
      },
      () => undefined,
    );
  };
  return { onStopChange };
};
