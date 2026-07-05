import { parsePrevisioni } from '../../src/lib/amt/parse-previsioni.ts';
import { cachedFetch } from '../cached-fetch.ts';
import { respondJson } from '../respond-json.ts';

const UPSTREAM =
  'https://www.amt.genova.it/amt/servizi/passaggi_xml.php?CodiceFermata=';

/** Free-plan Workers allow 50 subrequests per invocation. */
const MAX_STOPS = 40;

/**
 * GET /api/arrivals-batch/:ids (comma-separated, ≤40) — the fleet
 * sweep's transport: one worker INVOCATION covers a whole polling
 * portion instead of one per stop. The per-stop endpoint at 90-120
 * requests/15 s per open tab burned ~280k invocations/day against
 * the account-wide 100k free quota; batching divides that by 40.
 */
export const arrivalsBatchHandler = async (
  match: readonly string[],
): Promise<Response> => {
  const ids = [...new Set((match[1] ?? '').split(','))]
    .filter((id) => /^\d{1,6}$/.test(id))
    .slice(0, MAX_STOPS);
  const entries = await Promise.all(
    ids.map(async (stopId): Promise<readonly [string, unknown]> => {
      const upstream = await cachedFetch(`${UPSTREAM}${stopId}`, 15).catch(
        () => undefined,
      );
      const rows = parsePrevisioni((await upstream?.text()) ?? '');
      return [stopId, rows];
    }),
  );
  return respondJson(Object.fromEntries(entries), 15);
};
