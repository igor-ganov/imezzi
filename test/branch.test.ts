import { describe, expect, test } from 'bun:test';
import { branch } from '../src/lib/branch.ts';

describe('branch', () => {
  test('runs onTrue for true', () => {
    expect(branch(true)(() => 'yes', () => 'no')).toBe('yes');
  });

  test('runs onFalse for false', () => {
    expect(branch(false)(() => 'yes', () => 'no')).toBe('no');
  });

  test('does not evaluate the losing branch for true', () => {
    const calls: string[] = [];
    branch(true)(
      () => calls.push('true'),
      () => calls.push('false'),
    );
    expect(calls).toEqual(['true']);
  });

  test('does not evaluate the losing branch for false', () => {
    const calls: string[] = [];
    branch(false)(
      () => calls.push('true'),
      () => calls.push('false'),
    );
    expect(calls).toEqual(['false']);
  });

  test('returns non-string values unchanged', () => {
    expect(branch(true)(() => 42, () => 0)).toBe(42);
    const obj = { a: 1 };
    expect(branch(false)(() => ({ a: 0 }), () => obj)).toBe(obj);
  });

  test('supports undefined as a branch result', () => {
    expect(branch(true)(() => undefined, () => undefined)).toBeUndefined();
  });

  test('curried form is reusable with different handlers', () => {
    const whenTrue = branch(true);
    expect(whenTrue(() => 1, () => 2)).toBe(1);
    expect(whenTrue(() => 'a', () => 'b')).toBe('a');
  });

  test('propagates exceptions thrown by the chosen branch', () => {
    expect(() =>
      branch(true)(
        () => {
          throw new Error('boom');
        },
        () => 'ok',
      ),
    ).toThrow('boom');
  });
});
