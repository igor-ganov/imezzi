import { parsePrevisioni } from '../../src/lib/amt/parse-previsioni.ts';
import { cachedFetch } from '../cached-fetch.ts';
import { respondJson } from '../respond-json.ts';

const UPSTREAM =
  'https://www.amt.genova.it/amt/servizi/passaggi_xml.php?CodiceFermata=';

/** GET /api/arrivals/:stopId — live SIMON predictions, 15 s cache. */
export const arrivalsHandler = async (
  match: readonly string[],
): Promise<Response> => {
  const stopId = encodeURIComponent(match[1] ?? '');
  const upstream = await cachedFetch(`${UPSTREAM}${stopId}`, 15);
  return respondJson(parsePrevisioni(await upstream.text()), 15);
};
