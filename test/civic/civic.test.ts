import { describe, expect, test } from 'bun:test';
import { buildCql } from '../../src/lib/civic/build-cql.ts';
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
});

describe('tilesInBbox', () => {
  test('covers the box with grid cells', () => {
    const tiles = tilesInBbox(8.93, 44.405, 8.94, 44.41);
    expect(tiles.length).toBeGreaterThan(1);
    expect(tiles[0]?.[0]).toMatch(/^-?\d+:-?\d+$/);
  });
});
