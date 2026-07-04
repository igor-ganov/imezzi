import type { CivicHit } from './civic-hit.ts';
import type { WfsCivicFeature } from './wfs-types.ts';

const title = (text: string): string =>
  text.toLowerCase().replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());

/** Map a WFS civic feature to a search/display hit. */
export const hitOfFeature = (feature: WfsCivicFeature): CivicHit => ({
  street: title(feature.properties.DESVIA),
  display: `${title(feature.properties.DESVIA)} ${feature.properties.TESTO}`,
  red: feature.properties.COLORE === 'R',
  municipio: feature.properties.NOME_MUNICIPIO,
  lon: feature.geometry.coordinates[0],
  lat: feature.geometry.coordinates[1],
  source: 'comune',
});
