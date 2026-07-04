import { describe, expect, test } from 'bun:test';
import type { CivicQuery } from '../../src/lib/civic/civic-query.ts';
import { photonFallback } from '../../src/lib/civic/photon-fallback.ts';
import { withMockedFetch } from './mock-fetch.ts';

const query = (partial: Partial<CivicQuery>): CivicQuery => ({
  street: 'Via Anzani',
  number: undefined,
  letter: '',
  red: false,
  ...partial,
});

const photonBody = (features: readonly unknown[]) => ({ features });

const feature = (properties: Record<string, string>) => ({
  geometry: { coordinates: [8.9342, 44.4077] },
  properties,
});

describe('photonFallback', () => {
  test('red query is spelled `rosso` for OSM', async () => {
    await withMockedFetch(
      () => photonBody([]),
      async (urls) => {
        await photonFallback(query({ number: 20, red: true }));
        expect(urls.length).toBe(1);
        expect(urls[0]).toContain('photon.komoot.io/api');
        expect(urls[0]).toContain('q=Via%20Anzani%2020%20rosso%20Genova');
      },
    );
  });

  test('black query sends the bare number', async () => {
    await withMockedFetch(
      () => photonBody([]),
      async (urls) => {
        await photonFallback(query({ number: 20 }));
        expect(urls[0]).toContain('q=Via%20Anzani%2020%20Genova');
      },
    );
  });

  test('no-number query sends street and city only', async () => {
    await withMockedFetch(
      () => photonBody([]),
      async (urls) => {
        await photonFallback(query({}));
        expect(urls[0]).toContain('q=Via%20Anzani%20Genova');
        expect(urls[0]).toContain('&limit=5');
        expect(urls[0]).toContain('&lat=44.41&lon=8.93');
      },
    );
  });

  test('maps features to hits and detects red from the housenumber', async () => {
    await withMockedFetch(
      () =>
        photonBody([
          feature({
            street: 'Via Anzani',
            housenumber: '20 rosso',
            city: 'Genova',
          }),
        ]),
      async () => {
        const hits = await photonFallback(query({ number: 20, red: true }));
        expect(hits).toEqual([
          {
            street: 'Via Anzani',
            display: 'Via Anzani 20 rosso',
            red: true,
            municipio: 'Genova',
            lon: 8.9342,
            lat: 44.4077,
            source: 'osm',
          },
        ]);
      },
    );
  });

  test('falls back to name, default city and black colour', async () => {
    await withMockedFetch(
      () => photonBody([feature({ name: 'Piazza De Ferrari' })]),
      async () => {
        const hits = await photonFallback(query({ street: 'Piazza De Ferrari' }));
        expect(hits).toEqual([
          {
            street: 'Piazza De Ferrari',
            display: 'Piazza De Ferrari',
            red: false,
            municipio: 'Genova',
            lon: 8.9342,
            lat: 44.4077,
            source: 'osm',
          },
        ]);
      },
    );
  });

  test('restores the original fetch afterwards', async () => {
    const original = globalThis.fetch;
    await withMockedFetch(
      () => photonBody([]),
      async () => {
        await photonFallback(query({}));
        expect(globalThis.fetch).not.toBe(original);
      },
    );
    expect(globalThis.fetch).toBe(original);
  });
});
