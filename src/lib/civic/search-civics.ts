import { fetchJson } from '../api/fetch-json.ts';
import { buildCql } from './build-cql.ts';
import type { CivicHit } from './civic-hit.ts';
import { expandStreetVariants } from './expand-street-variants.ts';
import { hitOfFeature } from './hit-of-feature.ts';
import { parseCivicQuery } from './parse-civic-query.ts';
import { photonFallback } from './photon-fallback.ts';
import type { WfsCivicResponse } from './wfs-types.ts';
import { wfsUrl } from './wfs-url.ts';

const officialHits = async (input: string): Promise<readonly CivicHit[]> => {
  const query = parseCivicQuery(input);
  const variants = expandStreetVariants(query.street);
  const batches = await Promise.all(
    variants.map((variant) =>
      fetchJson<WfsCivicResponse>(
        wfsUrl({ cql: buildCql(query, variant), count: 8 }),
      ).catch((): WfsCivicResponse => ({ features: [] })),
    ),
  );
  const unique = new Map(
    batches
      .flatMap((batch) => batch.features)
      .map((feature) => [JSON.stringify(feature.geometry.coordinates), feature]),
  );
  return Array.from(unique.values())
    .map(hitOfFeature)
    .sort((a, b) => `${a.red}`.localeCompare(`${b.red}`));
};

/**
 * Civic-aware address search: official Comune WFS first (black
 * before red unless red was asked), OSM Photon fallback (US-2).
 */
export const searchCivics = async (
  input: string,
): Promise<readonly CivicHit[]> => {
  const official = await officialHits(input);
  return {
    true: () => photonFallback(parseCivicQuery(input)),
    false: () => Promise.resolve(official),
  }[`${official.length === 0}`]();
};
