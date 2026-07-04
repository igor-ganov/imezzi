import { describe, expect, test } from 'bun:test';
import { parseGtfsCsv } from '../../scripts/gtfs/parse-gtfs-csv.ts';

describe('parseGtfsCsv', () => {
  test('keys records by the header row', () => {
    const rows = parseGtfsCsv('route_id,route_type\n1,3\n2,1\n');
    expect(rows.length).toBe(2);
    expect(rows[0]?.['route_id']).toBe('1');
    expect(rows[0]?.['route_type']).toBe('3');
    expect(rows[1]?.['route_type']).toBe('1');
  });

  test('quoted fields keep embedded commas', () => {
    const rows = parseGtfsCsv('stop_id,stop_name\n7,"Piazza, Centro"\n');
    expect(rows[0]?.['stop_name']).toBe('Piazza, Centro');
    expect(rows[0]?.['stop_id']).toBe('7');
  });

  test('quoted field in the middle of a row', () => {
    const rows = parseGtfsCsv('a,b,c\n1,"x, y",3\n');
    expect(rows[0]?.['b']).toBe('x, y');
    expect(rows[0]?.['c']).toBe('3');
  });

  test('CRLF line endings are stripped', () => {
    const rows = parseGtfsCsv('a,b\r\n1,2\r\n');
    expect(rows[0]?.['a']).toBe('1');
    expect(rows[0]?.['b']).toBe('2');
  });

  test('trailing blank lines add no records', () => {
    expect(parseGtfsCsv('a,b\n1,2\n\n\r\n').length).toBe(1);
  });

  test('rows wider than the header keep the named columns intact', () => {
    const rows = parseGtfsCsv('a,b\n1,2,3\n');
    expect(rows.length).toBe(1);
    expect(rows[0]?.['a']).toBe('1');
    expect(rows[0]?.['b']).toBe('2');
  });

  test('empty trailing cell parses as empty string', () => {
    const rows = parseGtfsCsv('a,b,c\n1,2,\n');
    expect(rows[0]?.['c']).toBe('');
  });

  test('header-only input yields no records', () => {
    expect(parseGtfsCsv('a,b\n')).toEqual([]);
  });
});
