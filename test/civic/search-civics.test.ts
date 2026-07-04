import { describe, expect, test } from 'bun:test';
import { searchCivics } from '../../src/lib/civic/search-civics.ts';
import type { WfsCivicFeature } from '../../src/lib/civic/wfs-types.ts';
import { withMockedFetch } from './mock-fetch.ts';

const wfsFeature = (
  colore: string | null,
  lon: number,
): WfsCivicFeature => ({
  geometry: { coordinates: [lon, 44.4077] },
  properties: {
    DESVIA: 'VIA ROMA',
    TESTO: '5',
    COLORE: colore,
    NOME_MUNICIPIO: 'I CENTRO EST',
    NUMERO: '0005',
    LETTERA: null,
  },
});

const photonFeature = {
  geometry: { coordinates: [8.9, 44.42] },
  properties: { street: 'Via Roma', housenumber: '5', city: 'Genova' },
};

const respondWith = (wfsFeatures: readonly WfsCivicFeature[]) =>
  (url: string): unknown =>
    ({
      true: { features: [photonFeature] },
      false: { features: wfsFeatures },
    })[`${url.includes('photon.komoot.io')}`];

describe('searchCivics', () => {
  test('an official hit short-circuits the photon fallback', async () => {
    await withMockedFetch(
      respondWith([wfsFeature('N', 8.93)]),
      async (urls) => {
        const hits = await searchCivics('Via Roma 5');
        expect(hits.length).toBe(1);
        expect(hits[0]?.source).toBe('comune');
        expect(urls.filter((url) => url.includes('photon'))).toEqual([]);
        expect(
          urls.filter((url) => url.includes('mappe.comune.genova.it')).length,
        ).toBe(1);
      },
    );
  });

  test('empty official results fall back to photon', async () => {
    await withMockedFetch(respondWith([]), async (urls) => {
      const hits = await searchCivics('Via Roma 5');
      expect(hits.length).toBe(1);
      expect(hits[0]?.source).toBe('osm');
      expect(urls.filter((url) => url.includes('photon')).length).toBe(1);
    });
  });

  test('sorts black civics before red ones', async () => {
    await withMockedFetch(
      respondWith([wfsFeature('R', 8.93), wfsFeature('N', 8.94)]),
      async () => {
        const hits = await searchCivics('Via Roma 5');
        expect(hits.map((hit) => hit.red)).toEqual([false, true]);
      },
    );
  });

  test('deduplicates features sharing coordinates', async () => {
    await withMockedFetch(
      respondWith([wfsFeature('N', 8.93), wfsFeature('N', 8.93)]),
      async () => {
        const hits = await searchCivics('Via Roma 5');
        expect(hits.length).toBe(1);
      },
    );
  });

  test('queries the WFS once per street variant', async () => {
    await withMockedFetch(
      respondWith([wfsFeature('N', 8.93)]),
      async (urls) => {
        await searchCivics('Via XX Settembre 20');
        const wfsCalls = urls.filter((url) =>
          url.includes('mappe.comune.genova.it'),
        );
        expect(wfsCalls.length).toBe(2);
        expect(wfsCalls[0]).toContain(encodeURIComponent('%XX SETTEMBRE%'));
        expect(wfsCalls[1]).toContain(encodeURIComponent('%VENTI SETTEMBRE%'));
      },
    );
  });
});
