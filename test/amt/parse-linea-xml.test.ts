import { describe, expect, test } from 'bun:test';
import { parseLineaXml } from '../../src/lib/amt/parse-linea-xml.ts';

const xml = await Bun.file(
  new URL('../fixtures/linea.xml', import.meta.url),
).text();

describe('parseLineaXml', () => {
  test('extracts stop markers from live fixture', () => {
    const { stops } = parseLineaXml(xml);
    expect(stops.length).toBe(53);
    expect(stops[0]).toEqual({
      id: '0170',
      name: 'CARICAMENTO/ACQUARIO',
      lat: 44.4107,
      lon: 8.92835,
    });
  });

  test('extracts route path as lon/lat pairs', () => {
    const { path } = parseLineaXml(xml);
    expect(path.length).toBe(904);
    expect(path[0]).toEqual([8.92833, 44.4107]);
  });
});
