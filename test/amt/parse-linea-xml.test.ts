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

  test('tolerates spaces around = in marker attributes', () => {
    const { stops } = parseLineaXml(
      '<marker lat = "44.4107" lng =  "8.92835" icon="x.png" ' +
        'label="0170 - CARICAMENTO/ACQUARIO">',
    );
    expect(stops).toEqual([
      { id: '0170', name: 'CARICAMENTO/ACQUARIO', lat: 44.4107, lon: 8.92835 },
    ]);
  });

  test('tolerates spaces around = in point attributes', () => {
    const { path } = parseLineaXml(
      '<point lng = "8.92833" lat =  "44.4107" />',
    );
    expect(path).toEqual([[8.92833, 44.4107]]);
  });

  test('parses compact attributes without spaces', () => {
    const geometry = parseLineaXml(
      '<marker lat="44.5" lng="8.9" label="0001 - VIA A">' +
        '<point lng="8.9" lat="44.5"/>',
    );
    expect(geometry.stops.length).toBe(1);
    expect(geometry.path.length).toBe(1);
  });

  test('markers without a numeric id label are ignored', () => {
    const { stops } = parseLineaXml(
      '<marker lat="44.5" lng="8.9" label="capolinea - VIA A">',
    );
    expect(stops).toEqual([]);
  });

  test('negative coordinates are accepted in points', () => {
    const { path } = parseLineaXml('<point lng="-8.9" lat="44.5"/>');
    expect(path).toEqual([[-8.9, 44.5]]);
  });
});
