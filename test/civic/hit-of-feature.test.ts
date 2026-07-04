import { describe, expect, test } from 'bun:test';
import { hitOfFeature } from '../../src/lib/civic/hit-of-feature.ts';
import type { WfsCivicFeature } from '../../src/lib/civic/wfs-types.ts';

const feature = (
  desvia: string,
  testo: string,
  colore: string | null,
): WfsCivicFeature => ({
  geometry: { coordinates: [8.9342, 44.4077] },
  properties: {
    DESVIA: desvia,
    TESTO: testo,
    COLORE: colore,
    NOME_MUNICIPIO: 'I CENTRO EST',
    NUMERO: '0020',
    LETTERA: null,
  },
});

describe('hitOfFeature', () => {
  test('title-cases the shouty official street name', () => {
    const hit = hitOfFeature(feature('VIA DELLA LIBERTA', '20', 'N'));
    expect(hit.street).toBe('Via Della Liberta');
    expect(hit.display).toBe('Via Della Liberta 20');
  });

  test('title-cases across apostrophes', () => {
    expect(hitOfFeature(feature("VIA SANT'ANNA", '5', 'N')).street).toBe(
      "Via Sant'Anna",
    );
  });

  test('COLORE R marks the hit red', () => {
    expect(hitOfFeature(feature('VIA ROMA', '20R', 'R')).red).toBe(true);
  });

  test('COLORE N and null are black', () => {
    expect(hitOfFeature(feature('VIA ROMA', '20', 'N')).red).toBe(false);
    expect(hitOfFeature(feature('VIA ROMA', '20', null)).red).toBe(false);
  });

  test('maps coordinates to lon/lat and tags the source', () => {
    const hit = hitOfFeature(feature('VIA ROMA', '20', 'N'));
    expect(hit.lon).toBe(8.9342);
    expect(hit.lat).toBe(44.4077);
    expect(hit.municipio).toBe('I CENTRO EST');
    expect(hit.source).toBe('comune');
  });
});
