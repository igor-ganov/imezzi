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

  test('XML entities in the destination pass through undecoded', () => {
    const row = parsePrevisioni(
      '<Previsione><Linea>001</Linea>' +
        '<Destinazione>PRA&apos; PALMARO</Destinazione></Previsione>',
    )[0];
    expect(row?.destination).toBe('PRA&apos; PALMARO');
  });

  test('whitespace around tags and values is tolerated', () => {
    const rows = parsePrevisioni(
      '<Previsione>\n  <Linea> 015 </Linea>\n  ' +
        '<Destinazione>  NERVI </Destinazione>\n  ' +
        '<PrevisioneArrivo> 5\' </PrevisioneArrivo>\n</Previsione>',
    );
    expect(rows.length).toBe(1);
    expect(rows[0]?.line).toBe('015');
    expect(rows[0]?.destination).toBe('NERVI');
    expect(rows[0]?.countdown).toBe("5'");
  });

  test('missing tags default to empty strings and false flags', () => {
    expect(parsePrevisioni('<Previsione></Previsione>')[0]).toEqual({
      line: '',
      destination: '',
      theoretical: false,
      arrivalTime: '',
      countdown: '',
      vehicle: '',
      full: false,
    });
  });

  test('parses every Previsione block in the document', () => {
    const rows = parsePrevisioni(
      '<ArrayOfPrevisione>' +
        '<Previsione><Linea>001</Linea></Previsione>' +
        '<Previsione><Linea>002</Linea></Previsione>' +
        '</ArrayOfPrevisione>',
    );
    expect(rows.map((row) => row.line)).toEqual(['001', '002']);
  });

  test('flags full buses', () => {
    const row = parsePrevisioni(
      '<Previsione><AutobusPieno>true</AutobusPieno></Previsione>',
    )[0];
    expect(row?.full).toBe(true);
  });
});
