import { parseLineStopsCsv } from '../../src/lib/amt/parse-line-stops-csv.ts';
import { parseLinesCsv } from '../../src/lib/amt/parse-lines-csv.ts';
import { parseStopsCsv } from '../../src/lib/amt/parse-stops-csv.ts';
import { cachedFetch } from '../cached-fetch.ts';
import { respondJson } from '../respond-json.ts';

const BASE = 'https://www.amt.genova.it/amt/servizi/app/dati/';

const sources: Record<
  string,
  { readonly file: string; readonly parse: (csv: string) => unknown; readonly ttl: number }
> = {
  stops: { file: 'app_stops.php', parse: parseStopsCsv, ttl: 3600 },
  lines: { file: 'app_lines.php', parse: parseLinesCsv, ttl: 86400 },
  'line-stops': {
    file: 'app_lines_stops.php',
    parse: parseLineStopsCsv,
    ttl: 86400,
  },
};

/**
 * GET /api/(stops|lines|line-stops) — the route pattern only admits
 * known keys, so the fallback is unreachable and exists for typing.
 */
export const staticDataHandler = async (
  match: readonly string[],
): Promise<Response> => {
  const entry = sources[match[1] ?? ''] ?? sources['stops'];
  const source = entry ?? { file: 'app_stops.php', parse: parseStopsCsv, ttl: 3600 };
  const upstream = await cachedFetch(`${BASE}${source.file}`, source.ttl);
  return respondJson(source.parse(await upstream.text()), source.ttl);
};
