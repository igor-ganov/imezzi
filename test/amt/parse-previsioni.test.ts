import { describe, expect, test } from 'bun:test';
import { parsePrevisioni } from '../../src/lib/amt/parse-previsioni.ts';

const xml = await Bun.file(
  new URL('../fixtures/previsioni.xml', import.meta.url),
).text();

describe('parsePrevisioni', () => {
  test('parses live fixture rows', () => {
    const rows = parsePrevisioni(xml);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toEqual({
      line: '018',
      destination: 'SAMPIERDARENA',
      theoretical: false,
      arrivalTime: '05:37:10',
      countdown: "18'",
      vehicle: '09301',
      full: false,
    });
  });

  test('flags theoretical (⚠ approximated) rows', () => {
    const row = parsePrevisioni(
      '<Previsione><Linea>015</Linea><Teorica>true</Teorica></Previsione>',
    )[0];
    expect(row?.theoretical).toBe(true);
  });

  test('returns empty list for empty document', () => {
    expect(parsePrevisioni('<ArrayOfPrevisione/>')).toEqual([]);
  });
});
