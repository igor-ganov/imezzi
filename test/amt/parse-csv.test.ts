import { describe, expect, test } from 'bun:test';
import { parseStopsCsv } from '../../src/lib/amt/parse-stops-csv.ts';
import { parseLinesCsv } from '../../src/lib/amt/parse-lines-csv.ts';
import { parseLineStopsCsv } from '../../src/lib/amt/parse-line-stops-csv.ts';

const fixture = (name: string) =>
  Bun.file(new URL(`../fixtures/${name}`, import.meta.url)).text();

describe('parseStopsCsv', () => {
  test('parses live fixture', async () => {
    const stops = parseStopsCsv(await fixture('app_stops.csv'));
    expect(stops.length).toBeGreaterThan(2500);
    expect(stops[0]).toEqual({
      id: '0001',
      name: 'CARICAMENTO/ACQUARIO',
      description: 'capolinea 9 32 635',
      lat: 44.410671,
      lon: 8.928418,
      lines: ['009-00', '032-00', '635-00'],
      monitored: true,
    });
  });
});

describe('parseLinesCsv', () => {
  test('parses live fixture', async () => {
    const lines = parseLinesCsv(await fixture('app_lines.csv'));
    expect(lines.length).toBeGreaterThan(100);
    expect(lines[0]).toEqual({
      id: '001-00',
      name: '1',
      from: 'Caricamento (Ponente)',
      to: 'Via Camozzini (Voltri)',
      category: '1',
    });
  });
});

describe('parseLineStopsCsv', () => {
  test('splits variant and direction', async () => {
    const refs = parseLineStopsCsv(await fixture('app_lines_stops.csv'));
    expect(refs[0]).toEqual({
      lineId: '001-00',
      direction: 1,
      stopId: '0170',
      position: 1,
    });
  });
});
