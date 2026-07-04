import { describe, expect, test } from 'bun:test';
import { branch } from '../src/lib/branch.ts';

describe('branch', () => {
  test('runs onTrue for true', () => {
    expect(branch(true)(() => 'yes', () => 'no')).toBe('yes');
  });

  test('runs onFalse for false', () => {
    expect(branch(false)(() => 'yes', () => 'no')).toBe('no');
  });
});
