import { parseLineaXml } from '../../src/lib/amt/parse-linea-xml.ts';
import { cachedFetch } from '../cached-fetch.ts';
import { respondJson } from '../respond-json.ts';

const UPSTREAM = 'https://www.amt.genova.it/amt/readxml_linea.php?file=';

/** GET /api/geometry/:code/:dir — route polyline + stops, 24 h cache. */
export const geometryHandler = async (
  match: readonly string[],
): Promise<Response> => {
  const file = `${match[1] ?? ''}_${match[2] ?? '1'}.xml`;
  const upstream = await cachedFetch(`${UPSTREAM}${file}`, 86400);
  return respondJson(parseLineaXml(await upstream.text()), 86400);
};
