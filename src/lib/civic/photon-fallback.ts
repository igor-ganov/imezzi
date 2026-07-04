import { fetchJson } from '../api/fetch-json.ts';
import type { CivicQuery } from './civic-query.ts';
import type { CivicHit } from './civic-hit.ts';

interface PhotonFeature {
  readonly geometry: { readonly coordinates: readonly [number, number] };
  readonly properties: {
    readonly name?: string;
    readonly street?: string;
    readonly housenumber?: string;
    readonly city?: string;
  };
}

const toHit = (feature: PhotonFeature): CivicHit => {
  const props = feature.properties;
  const number = props.housenumber ?? '';
  return {
    street: props.street ?? props.name ?? '',
    display: `${props.street ?? props.name ?? ''} ${number}`.trim(),
    red: /rosso/i.test(number),
    municipio: props.city ?? 'Genova',
    lon: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1],
    source: 'osm',
  };
};

/**
 * OSM fallback via Photon. Red civics are tagged `20 rosso` in OSM —
 * the literal `20r` form finds nothing, so we send the spelled form
 * (verified live; civic-addresses AC-2.4).
 */
export const photonFallback = async (
  query: CivicQuery,
): Promise<readonly CivicHit[]> => {
  const suffix = { true: ' rosso', false: '' }[`${query.red}`];
  const numberPart = { true: '', false: ` ${query.number}${suffix}` }[
    `${query.number === undefined}`
  ];
  const q = encodeURIComponent(`${query.street}${numberPart} Genova`);
  const url = `https://photon.komoot.io/api?q=${q}&limit=5&lat=44.41&lon=8.93&zoom=16`;
  const response = await fetchJson<{ features: readonly PhotonFeature[] }>(url);
  return response.features.map(toHit);
};
