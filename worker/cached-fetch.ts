interface CfRequestInit extends RequestInit {
  readonly cf: {
    readonly cacheTtl: number;
    readonly cacheEverything: boolean;
  };
}

/**
 * Fetch through Cloudflare's edge cache with a fixed TTL. AMT's PHP
 * endpoints return an empty body when no User-Agent is sent (workerd
 * sends none by default) — so always identify ourselves.
 */
export const cachedFetch = (url: string, ttl: number): Promise<Response> => {
  const init: CfRequestInit = {
    headers: { 'user-agent': 'imezzi/1.0 (+https://github.com/igor-ganov/imezzi)' },
    cf: { cacheTtl: ttl, cacheEverything: true },
  };
  return fetch(url, init);
};
