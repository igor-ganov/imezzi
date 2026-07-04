import { describe, expect, test } from 'bun:test';
import { wfsUrl } from '../../src/lib/civic/wfs-url.ts';

const BASE =
  'https://mappe.comune.genova.it/geoserver/ows?service=WFS&version=2.0.0' +
  '&request=GetFeature&typeNames=MEDIATORE:V_CIVICI_DBT_ANGOLO_GEOSERVER' +
  '&outputFormat=application/json&srsName=EPSG:4326';

describe('wfsUrl', () => {
  test('cql filter is URI-encoded', () => {
    expect(wfsUrl({ cql: "DESVIA ILIKE '%ROMA%'", count: 8 })).toBe(
      `${BASE}&count=8&CQL_FILTER=DESVIA%20ILIKE%20'%25ROMA%25'`,
    );
  });

  test('bbox joins coordinates and appends the CRS', () => {
    expect(wfsUrl({ bbox: [8.9, 44.4, 8.94, 44.41], count: 500 })).toBe(
      `${BASE}&count=500&bbox=8.9,44.4,8.94,44.41,EPSG:4326`,
    );
  });

  test('neither cql nor bbox yields the bare count URL', () => {
    expect(wfsUrl({ count: 8 })).toBe(`${BASE}&count=8`);
  });

  test('empty cql string is treated as absent', () => {
    expect(wfsUrl({ cql: '', count: 8 })).toBe(`${BASE}&count=8`);
  });

  test('both cql and bbox appear when given together', () => {
    const url = wfsUrl({ cql: 'X=1', bbox: [1, 2, 3, 4], count: 9 });
    expect(url).toContain('&CQL_FILTER=X%3D1');
    expect(url).toContain('&bbox=1,2,3,4,EPSG:4326');
    expect(url).toContain('&count=9');
  });
});
