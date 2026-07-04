import { romeDateString } from '../../src/lib/trains/rome-date-string.ts';
import { cachedFetch } from '../cached-fetch.ts';

const BASE = 'http://www.viaggiatreno.it/infomobilita/resteasy/viaggiatreno';

/**
 * GET /api/trains/:board(partenze|arrivi)/:station — Trenitalia
 * ViaggiaTreno departure/arrival board, 30 s cache. The upstream is
 * already JSON; pass it through with CORS + cache headers.
 */
export const trainsHandler = async (
  match: readonly string[],
): Promise<Response> => {
  const board = match[1] ?? 'partenze';
  const station = encodeURIComponent(match[2] ?? '');
  const when = encodeURIComponent(romeDateString(new Date()));
  const upstream = await cachedFetch(`${BASE}/${board}/${station}/${when}`, 30);
  return new Response(await upstream.text(), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30',
      'access-control-allow-origin': '*',
    },
  });
};
