import { routes } from './routes.ts';

/**
 * Cloudflare Worker: static site (ASSETS) + `/api/*` proxy for the
 * upstream transit APIs that lack CORS (AMT SIMON, ViaggiaTreno) —
 * live-map design §1. Unmatched paths fall through to the site.
 */
interface Env {
  readonly ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  fetch: (request: Request, env: Env): Promise<Response> => {
    const path = new URL(request.url).pathname;
    return (
      routes
        .filter(({ pattern }) => pattern.test(path))
        .map(({ pattern, handler }) => handler(pattern.exec(path) ?? []))
        .at(0) ?? env.ASSETS.fetch(request)
    );
  },
};
