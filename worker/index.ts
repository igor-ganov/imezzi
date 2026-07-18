import { routes } from './routes.ts';

export { FleetHub } from './fleet-hub.ts';

/**
 * Cloudflare Worker: static site (ASSETS) + `/api/*` proxy for the
 * upstream transit APIs that lack CORS (AMT SIMON, ViaggiaTreno) —
 * live-map design §1. `/api/fleet-ws` upgrades into the FleetHub
 * Durable Object (one shared city poller for all clients). Unmatched
 * paths fall through to the site.
 */
interface Env {
  readonly ASSETS: { fetch: (request: Request) => Promise<Response> };
  readonly FLEET_HUB: {
    readonly idFromName: (name: string) => unknown;
    readonly get: (
      id: unknown,
      options?: { readonly locationHint: string },
    ) => {
      readonly fetch: (request: Request) => Promise<Response>;
    };
  };
}

export default {
  fetch: (request: Request, env: Env): Promise<Response> => {
    const path = new URL(request.url).pathname;
    // Pin the shared hub to Western Europe: the original colo AMT/Akamai
    // empty-bodied every upstream request (errors:45/tick, zero
    // sightings), while request-colo /api hits near Italy fetch fine.
    // A fresh DO id relocates the singleton with the placement hint —
    // the hint only applies at creation, so the name must change too.
    const hub = (): Promise<Response> =>
      env.FLEET_HUB.get(env.FLEET_HUB.idFromName('city-eu'), {
        locationHint: 'weur',
      }).fetch(request);
    const special: Readonly<Record<string, () => Promise<Response>>> = {
      '/api/fleet-ws': hub,
      '/api/fleet-log': hub,
    };
    return (
      special[path]?.() ??
      routes
        .filter(({ pattern }) => pattern.test(path))
        .map(({ pattern, handler }) => handler(pattern.exec(path) ?? []))
        .at(0) ??
      env.ASSETS.fetch(request)
    );
  },
};
