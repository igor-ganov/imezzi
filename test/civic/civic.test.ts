import { describe, expect, test } from 'bun:test';
import { buildCql } from '../../src/lib/civic/build-cql.ts';
import type { CivicQuery } from '../../src/lib/civic/civic-query.ts';
import { expandStreetVariants } from '../../src/lib/civic/expand-street-variants.ts';
import { parseCivicQuery } from '../../src/lib/civic/parse-civic-query.ts';
import { tilesInBbox } from '../../src/lib/civic/tile-key.ts';

describe('parseCivicQuery', () => {
  test('recognises the r suffix', () => {
    expect(parseCivicQuery('Via XX Settembre 20r')).toEqual({
      street: 'Via XX Settembre',
      number: 20,
      letter: '',
      red: true,
    });
  });

  test('recognises the spelled rosso form', () => {
    expect(parseCivicQuery('via venti settembre 20 rosso').red).toBe(true);
  });

  test('black address by default, letter preserved', () => {
    const query = parseCivicQuery('Via Marasso 12A');
    expect(query.red).toBe(false);
    expect(query.letter).toBe('A');
    expect(query.number).toBe(12);
  });

  test('street-only query has no number', () => {
    expect(parseCivicQuery('Piazza De Ferrari').number).toBeUndefined();
  });

  test('recognises the dotted r. suffix', () => {
    expect(parseCivicQuery('Via Roma 20 r.')).toEqual({
      street: 'Via Roma',
      number: 20,
      letter: '',
      red: true,
    });
  });

  test('recognises the attached uppercase R suffix', () => {
    expect(parseCivicQuery('Via Roma 20R')).toEqual({
      street: 'Via Roma',
      number: 20,
      letter: '',
      red: true,
    });
  });

  test('letter and red suffix combine (20Lr)', () => {
    expect(parseCivicQuery('Via Roma 20Lr')).toEqual({
      street: 'Via Roma',
      number: 20,
      letter: 'L',
      red: true,
    });
  });

  test('comma separates street from number', () => {
    expect(parseCivicQuery('Via Roma, 20')).toEqual({
      street: 'Via Roma',
      number: 20,
      letter: '',
      red: false,
    });
  });

  test('collapses extra whitespace everywhere', () => {
    expect(parseCivicQuery('  Via   Roma   20  rosso ')).toEqual({
      street: 'Via Roma',
      number: 20,
      letter: '',
      red: true,
    });
  });

  test('number-only input stays a street query', () => {
    expect(parseCivicQuery('20')).toEqual({
      street: '20',
      number: undefined,
      letter: '',
      red: false,
    });
  });

  test('digits inside the street name are not the civic', () => {
    expect(parseCivicQuery('Via 4 Novembre 12')).toEqual({
      street: 'Via 4 Novembre',
      number: 12,
      letter: '',
      red: false,
    });
  });
});

describe('expandStreetVariants', () => {
  test('spells roman numerals like the stradario', () => {
    expect(expandStreetVariants('Via XX Settembre')).toContain(
      'venti settembre',
    );
  });

  test('strips the street-type prefix', () => {
    expect(expandStreetVariants('Corso Europa')).toEqual(['europa']);
  });

  test('spells every roman numeral in the stradario list', () => {
    expect(expandStreetVariants('Via XXV Aprile')).toContain('venticinque aprile');
    expect(expandStreetVariants('Via XXIV Maggio')).toContain('ventiquattro maggio');
    expect(expandStreetVariants('Via XX Settembre')).toContain('venti settembre');
    expect(expandStreetVariants('Via XII Ottobre')).toContain('dodici ottobre');
    expect(expandStreetVariants('Corso IX Febbraio')).toContain('nove febbraio');
    expect(expandStreetVariants('Via IV Novembre')).toContain('quattro novembre');
    expect(expandStreetVariants('Corso V Maggio')).toContain('cinque maggio');
    expect(expandStreetVariants('Via II Dicembre')).toContain('due dicembre');
  });

  test('keeps the literal roman spelling as first variant', () => {
    expect(expandStreetVariants('Via XXV Aprile')).toEqual([
      'xxv aprile',
      'venticinque aprile',
    ]);
  });

  test('strips corso, piazza, salita and vico prefixes', () => {
    expect(expandStreetVariants('Corso Buenos Aires')).toEqual(['buenos aires']);
    expect(expandStreetVariants('Piazza De Ferrari')).toEqual(['de ferrari']);
    expect(expandStreetVariants('Salita Santa Caterina')).toEqual(['santa caterina']);
    expect(expandStreetVariants('Vico Dritto Ponticello')).toEqual(['dritto ponticello']);
  });

  test('strips accents to match the stradario spelling', () => {
    expect(expandStreetVariants('Corso Andrea Podestà')).toEqual(['andrea podesta']);
  });

  test('deduplicates when no roman numeral is present', () => {
    expect(expandStreetVariants('Via Roma')).toEqual(['roma']);
  });

  test('empty street expands to nothing', () => {
    expect(expandStreetVariants('')).toEqual([]);
  });
});

describe('buildCql', () => {
  test('red query pins colour and pads the number', () => {
    const cql = buildCql(parseCivicQuery('Via XX Settembre 20r'), 'venti settembre');
    expect(cql).toBe(
      "DESVIA ILIKE '%VENTI SETTEMBRE%' AND NUMERO='0020' AND COLORE='R'",
    );
  });

  test('black query leaves colour open for homonym listing', () => {
    expect(buildCql(parseCivicQuery('Via Roma 5'), 'roma')).toBe(
      "DESVIA ILIKE '%ROMA%' AND NUMERO='0005'",
    );
  });

  test('letter gets its own clause', () => {
    expect(buildCql(parseCivicQuery('Via Marasso 12A'), 'marasso')).toBe(
      "DESVIA ILIKE '%MARASSO%' AND NUMERO='0012' AND LETTERA='A'",
    );
  });

  test("doubles apostrophes in the street variant (Sant'Anna)", () => {
    expect(buildCql(parseCivicQuery("Salita Sant'Anna 5"), "sant'anna")).toBe(
      "DESVIA ILIKE '%SANT''ANNA%' AND NUMERO='0005'",
    );
  });

  test('no-number query filters on street only', () => {
    expect(buildCql(parseCivicQuery('Piazza De Ferrari'), 'de ferrari')).toBe(
      "DESVIA ILIKE '%DE FERRARI%'",
    );
  });

  test('red without number pins only street and colour', () => {
    const query: CivicQuery = {
      street: 'Via Roma',
      number: undefined,
      letter: '',
      red: true,
    };
    expect(buildCql(query, 'roma')).toBe(
      "DESVIA ILIKE '%ROMA%' AND COLORE='R'",
    );
  });
});

describe('tilesInBbox', () => {
  test('covers the box with grid cells', () => {
    const tiles = tilesInBbox(8.93, 44.405, 8.94, 44.41);
    expect(tiles.length).toBeGreaterThan(1);
    expect(tiles[0]?.[0]).toMatch(/^-?\d+:-?\d+$/);
  });

  test('a bbox inside one cell yields that single cell', () => {
    expect(tilesInBbox(0.001, 0.001, 0.002, 0.002)).toEqual([
      ['0:0', [0, 0, 0.004, 0.004]],
    ]);
  });

  test('negative coordinates floor toward minus infinity', () => {
    const keys = tilesInBbox(-0.005, -0.005, -0.001, -0.001).map(
      (tile) => tile[0],
    );
    expect(keys).toEqual(['-2:-2', '-2:-1', '-1:-2', '-1:-1']);
  });

  test('exact-boundary bbox spills into the neighbouring cells', () => {
    const tiles = tilesInBbox(0, 0, 0.004, 0.004);
    expect(tiles.map((tile) => tile[0])).toEqual(['0:0', '0:1', '1:0', '1:1']);
    expect(tiles[3]?.[1]).toEqual([0.004, 0.004, 0.008, 0.008]);
  });
});
