import { describe, expect, test } from 'bun:test';
import { filterLines } from '../../src/lib/lines/filter-lines.ts';

const lines = [
  { label: '9', description: 'Caricamento ⇄ Pontedecimo' },
  { label: 'MM', description: 'Metropolitana Brin - Brignole' },
  { label: 'FP', description: 'Funicolare Principe - Granarolo' },
  { label: 'NP', description: 'Navebus Pegli - Prà' },
];

describe('filterLines', () => {
  test('empty query returns every line', () => {
    expect(filterLines(lines, '')).toEqual(lines);
  });

  test('whitespace-only query returns every line', () => {
    expect(filterLines(lines, '   ')).toEqual(lines);
  });

  test('matches on the badge label', () => {
    expect(filterLines(lines, '9').map((line) => line.label)).toEqual(['9']);
  });

  test('matches on the description', () => {
    expect(filterLines(lines, 'granarolo').map((line) => line.label)).toEqual([
      'FP',
    ]);
  });

  test('label match is case-insensitive', () => {
    expect(filterLines(lines, 'mm').map((line) => line.label)).toEqual(['MM']);
  });

  test('accented text matches an unaccented query', () => {
    expect(filterLines(lines, 'pra').map((line) => line.label)).toEqual(['NP']);
  });

  test('accented query matches too', () => {
    expect(filterLines(lines, 'PRÀ').map((line) => line.label)).toEqual(['NP']);
  });

  test('query is trimmed before matching', () => {
    expect(filterLines(lines, '  brin  ').map((line) => line.label)).toEqual([
      'MM',
    ]);
  });

  test('a query matching several descriptions keeps them all', () => {
    expect(filterLines(lines, 'pe').map((line) => line.label)).toEqual([
      'FP',
      'NP',
    ]);
  });

  test('no match yields an empty list', () => {
    expect(filterLines(lines, 'xyz')).toEqual([]);
  });
});
