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

  test('empty lines column becomes an empty list', () => {
    const stops = parseStopsCsv('0002;PIAZZA;desc;44.4;8.9;;1');
    expect(stops[0]?.lines).toEqual([]);
  });

  test('trailing newline does not add a phantom stop', () => {
    const stops = parseStopsCsv('0002;PIAZZA;desc;44.4;8.9;009-00;1\n');
    expect(stops.length).toBe(1);
  });

  test('monitored 0 parses to false', () => {
    const stops = parseStopsCsv('0002;PIAZZA;desc;44.4;8.9;009-00;0');
    expect(stops[0]?.monitored).toBe(false);
  });

  test('blank rows between records are skipped', () => {
    const stops = parseStopsCsv(
      '0001;A;d;44.4;8.9;;1\n\n0002;B;d;44.5;8.8;;0\n',
    );
    expect(stops.map((stop) => stop.id)).toEqual(['0001', '0002']);
  });

  test('short rows default missing cells', () => {
    expect(parseStopsCsv('0009')[0]).toEqual({
      id: '0009',
      name: '',
      description: '',
      lat: 0,
      lon: 0,
      lines: [],
      monitored: false,
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

  test('trims the category cell', () => {
    const lines = parseLinesCsv('009-00;9;A;B; 4 ');
    expect(lines[0]?.category).toBe('4');
  });

  test('short rows default missing cells to empty strings', () => {
    expect(parseLinesCsv('009-00;9')[0]).toEqual({
      id: '009-00',
      name: '9',
      from: '',
      to: '',
      category: '',
    });
  });

  test('trailing newline and blank rows are skipped', () => {
    expect(parseLinesCsv('a;b;c;d;e\n\n').length).toBe(1);
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

  test('variant without an underscore gets direction 0', () => {
    expect(parseLineStopsCsv('009-00;0170;3')[0]).toEqual({
      lineId: '009-00',
      direction: 0,
      stopId: '0170',
      position: 3,
    });
  });

  test('numeric fields parse from strings', () => {
    expect(parseLineStopsCsv('015-01_2;0042;12')[0]).toEqual({
      lineId: '015-01',
      direction: 2,
      stopId: '0042',
      position: 12,
    });
  });
});
