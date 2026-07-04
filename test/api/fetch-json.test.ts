import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';
import { fetchJson } from '../../src/lib/api/fetch-json.ts';

const jsonResponse = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const stubFetch = (response: Response) =>
  spyOn(globalThis, 'fetch').mockResolvedValue(response);

afterEach(() => {
  mock.restore();
});

describe('fetchJson', () => {
  test('returns parsed JSON on 200', async () => {
    stubFetch(jsonResponse({ hello: 'world', n: 3 }, 200));
    const data = await fetchJson<{ hello: string; n: number }>('https://api.test/data');
    expect(data).toEqual({ hello: 'world', n: 3 });
  });

  test('parses JSON arrays and primitives', async () => {
    stubFetch(jsonResponse([1, 2, 3], 200));
    expect(await fetchJson<readonly number[]>('https://api.test/list')).toEqual([1, 2, 3]);
  });

  test('accepts any 2xx status', async () => {
    stubFetch(jsonResponse({ created: true }, 201));
    expect(await fetchJson<{ created: boolean }>('https://api.test/new')).toEqual({
      created: true,
    });
  });

  test('passes the url to fetch', async () => {
    const spy = stubFetch(jsonResponse({}, 200));
    await fetchJson('https://api.test/exact-url');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('https://api.test/exact-url');
  });

  test('rejects on 404 with status in the message', async () => {
    stubFetch(jsonResponse({ error: 'missing' }, 404));
    await expect(fetchJson('https://api.test/missing')).rejects.toThrow('404');
  });

  test('rejection message names the method, url and status', async () => {
    stubFetch(jsonResponse({}, 500));
    await expect(fetchJson('https://api.test/broken')).rejects.toThrow(
      'GET https://api.test/broken → 500',
    );
  });

  test('rejects on 3xx (non-ok) status', async () => {
    stubFetch(jsonResponse({}, 302));
    await expect(fetchJson('https://api.test/redirect')).rejects.toThrow('302');
  });

  test('does not attempt to parse the body on failure', async () => {
    stubFetch(new Response('not json at all', { status: 503 }));
    await expect(fetchJson('https://api.test/down')).rejects.toThrow('503');
  });

  test('propagates network-level failures', async () => {
    spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    await expect(fetchJson('https://api.test/unreachable')).rejects.toThrow('network down');
  });

  test('rejects when the body is not valid JSON on a 2xx response', async () => {
    stubFetch(new Response('<html>oops</html>', { status: 200 }));
    await expect(fetchJson('https://api.test/html')).rejects.toThrow();
  });
});
