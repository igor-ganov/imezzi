import { describe, expect, test } from 'bun:test';
import { normalizeLineLabel } from '../../src/lib/vehicles/normalize-line-label.ts';

describe('normalizeLineLabel', () => {
  test('strips zero padding from numeric codes', () => {
    expect(normalizeLineLabel('009')).toBe('9');
  });

  test('strips zero padding before barred-line slashes', () => {
    expect(normalizeLineLabel('05/')).toBe('5/');
  });

  test('keeps night-line labels intact', () => {
    expect(normalizeLineLabel('N1')).toBe('N1');
  });

  test('keeps alphabetic labels intact', () => {
    expect(normalizeLineLabel('MM')).toBe('MM');
  });

  test('uppercases lowercase input', () => {
    expect(normalizeLineLabel('n1')).toBe('N1');
    expect(normalizeLineLabel('mm')).toBe('MM');
  });

  test('a lone zero survives', () => {
    expect(normalizeLineLabel('0')).toBe('0');
  });

  test('all-zero codes collapse to a single zero', () => {
    expect(normalizeLineLabel('00')).toBe('0');
    expect(normalizeLineLabel('000')).toBe('0');
  });

  test('trims surrounding whitespace', () => {
    expect(normalizeLineLabel('  9  ')).toBe('9');
    expect(normalizeLineLabel(' 009 ')).toBe('9');
  });

  test('zero padding before letters is stripped too', () => {
    expect(normalizeLineLabel('0N1')).toBe('N1');
  });
});
