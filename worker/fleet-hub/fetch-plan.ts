import { parseLineStopsCsv } from '../../src/lib/amt/parse-line-stops-csv.ts';
import { parseStopsCsv } from '../../src/lib/amt/parse-stops-csv.ts';
import { fleetPlan } from '../../src/lib/fleet/fleet-plan.ts';
import { cachedFetch } from '../cached-fetch.ts';

const BASE = 'https://www.amt.genova.it/amt/servizi/app/dati/';
const STRIDE = 6;

/**
 * The city sweep plan, built server-side from the same upstream CSVs
 * the /api static-data routes proxy (2 subrequests, hour-cached).
 */
export const fetchPlan = async (): Promise<readonly string[]> => {
  const [stopsCsv, refsCsv] = await Promise.all([
    cachedFetch(`${BASE}app_stops.php`, 3600).then((r) => r.text()),
    cachedFetch(`${BASE}app_lines_stops.php`, 86400).then((r) => r.text()),
  ]);
  return fleetPlan(parseStopsCsv(stopsCsv), parseLineStopsCsv(refsCsv), STRIDE);
};
