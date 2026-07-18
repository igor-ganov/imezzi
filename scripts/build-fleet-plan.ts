/**
 * Build-time fleet sweep plan (live-map US-1): the ~900 stop IDs the
 * FleetHub polls city-wide, baked to a static JSON the Durable Object
 * imports directly. The DO used to fetch the AMT CSVs at runtime, but
 * a Cloudflare `cacheEverything` empty-response poisoning in the DO's
 * home colo left the plan empty for days (identical fetches from the
 * request-colo worker path returned full data) — silently killing the
 * whole live fleet. A committed snapshot removes that failure mode and
 * every per-tick subrequest. Regenerate when AMT routes change:
 * `bun scripts/build-fleet-plan.ts`.
 */
import { parseLineStopsCsv } from '../src/lib/amt/parse-line-stops-csv.ts';
import { parseStopsCsv } from '../src/lib/amt/parse-stops-csv.ts';
import { fleetPlan } from '../src/lib/fleet/fleet-plan.ts';

const BASE = 'https://www.amt.genova.it/amt/servizi/app/dati/';
const STRIDE = 6;
const ua = { headers: { 'user-agent': 'imezzi/1.0 (+https://github.com/igor-ganov/imezzi)' } };

const [stopsCsv, refsCsv] = await Promise.all([
  fetch(`${BASE}app_stops.php`, ua).then((response) => response.text()),
  fetch(`${BASE}app_lines_stops.php`, ua).then((response) => response.text()),
]);

const plan = fleetPlan(parseStopsCsv(stopsCsv), parseLineStopsCsv(refsCsv), STRIDE);

const enough = plan.length > 500;
const write = {
  true: () => Bun.write('worker/fleet-hub/fleet-plan.json', JSON.stringify(plan)),
  false: () => Promise.reject(new Error(`plan too small (${plan.length}) — refusing to overwrite`)),
}[`${enough}`];
await write();
console.log(`worker/fleet-hub/fleet-plan.json: ${plan.length} stop IDs`);
