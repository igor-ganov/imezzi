import { describe, expect, test } from 'bun:test';
import { respondJson } from '../../worker/respond-json.ts';

describe('respondJson', () => {
  test('responds 200 with the serialized payload', async () => {
    const response = respondJson({ hello: 'genova' }, 15);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hello: 'genova' });
  });

  test('sets JSON content type with charset', () => {
    expect(respondJson([], 15).headers.get('content-type')).toBe(
      'application/json; charset=utf-8',
    );
  });

  test('cache-control carries the given max-age', () => {
    expect(respondJson([], 86400).headers.get('cache-control')).toBe(
      'public, max-age=86400',
    );
  });

  test('opens CORS to any origin', () => {
    expect(respondJson([], 15).headers.get('access-control-allow-origin')).toBe(
      '*',
    );
  });

  test('serializes arrays and primitives too', async () => {
    expect(await respondJson([1, 2], 15).json()).toEqual([1, 2]);
    expect(await respondJson('x', 15).text()).toBe('"x"');
  });
});
