/**
 * Cloudflare Worker: serves the static site (ASSETS binding) and will
 * proxy the upstream transit/geodata APIs that lack CORS headers
 * (design §4). Proxy routes are added per data source as they land.
 */
interface Env {
  readonly ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  fetch: (request: Request, env: Env): Promise<Response> =>
    env.ASSETS.fetch(request),
};
