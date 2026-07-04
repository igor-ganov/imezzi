import { describe, expect, test } from 'bun:test';
import { tagValue } from '../../src/lib/amt/tag-value.ts';

describe('tagValue', () => {
  test('extracts the trimmed text content of a tag', () => {
    expect(tagValue('<Linea>  015 </Linea>', 'Linea')).toBe('015');
  });

  test('missing tag yields an empty string', () => {
    expect(tagValue('<Linea>015</Linea>', 'Destinazione')).toBe('');
  });

  test('empty element yields an empty string', () => {
    expect(tagValue('<Linea></Linea>', 'Linea')).toBe('');
  });

  test('multiple occurrences return the first one', () => {
    expect(tagValue('<L>first</L><L>second</L>', 'L')).toBe('first');
  });

  test('tags with attributes are not matched', () => {
    expect(tagValue('<L attr="x">value</L>', 'L')).toBe('');
  });

  test('nested markup inside the tag is not matched', () => {
    expect(tagValue('<L><Inner>x</Inner></L>', 'L')).toBe('');
    expect(tagValue('<L><Inner>x</Inner></L>', 'Inner')).toBe('x');
  });
});
