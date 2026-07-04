/**
 * Build-time GTFS ingestion (live-map design §3): downloads the AMT
 * feed (CC BY 4.0, © AMT Genova) and emits compact JSON artifacts
 * under public/data/. Run: `bun scripts/build-gtfs.ts`.
 */
import { unzipSync } from 'fflate';
import { buildSchedule } from './gtfs/build-schedule.ts';
import { modeOf } from './gtfs/mode-of.ts';
import { parseGtfsCsv } from './gtfs/parse-gtfs-csv.ts';

const GTFS_URL = 'https://www.amt.genova.it/amt/GTFS/GTFS_AMT_GENOVA.zip';

const response = await fetch(GTFS_URL);
const archive = unzipSync(new Uint8Array(await response.arrayBuffer()));
const decoder = new TextDecoder();
const table = (name: string) => parseGtfsCsv(decoder.decode(archive[name]));

const routes = table('routes.txt');
const trips = table('trips.txt');
const stopTimes = table('stop_times.txt');
const calendarDates = table('calendar_dates.txt');
const stops = table('stops.txt');

const schedule = buildSchedule(routes, trips, stopTimes, calendarDates);

const referenced = new Set(
  schedule.lines.flatMap((line) =>
    line.directions.flatMap((direction) => direction.stops),
  ),
);
const stopsDict = Object.fromEntries(
  stops
    .filter((stop) => referenced.has(stop['stop_id'] ?? ''))
    .map((stop) => [
      stop['stop_id'] ?? '',
      {
        name: stop['stop_name'] ?? '',
        lat: Number(stop['stop_lat'] ?? '0'),
        lon: Number(stop['stop_lon'] ?? '0'),
      },
    ]),
);

const lines = routes.map((route) => ({
  id: route['route_id'] ?? '',
  shortName: route['route_short_name'] ?? '',
  longName: route['route_long_name'] ?? '',
  mode: modeOf(route['route_type'] ?? ''),
}));

await Bun.write(
  'public/data/schedule.json',
  JSON.stringify({ ...schedule, stops: stopsDict }),
);
await Bun.write('public/data/lines.json', JSON.stringify(lines));
console.log(
  `lines.json: ${lines.length} routes; schedule.json: ${schedule.lines.length} non-bus lines, ${referenced.size} stops`,
);
