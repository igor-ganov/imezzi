import type { Page, Route } from '@playwright/test';
import { fixture, makePlan, makeSchedule } from './fixtures.ts';

type Fulfill = Parameters<Route['fulfill']>[0];

// fulfill races the context teardown: a tile request in flight while
// the test ends makes fulfill throw, the async handler rejects and
// the teardown waits out its 30 s timeout. Swallow those — a dying
// context does not need the response.
const answer =
  (payload: Fulfill) =>
  (route: Route): Promise<void> =>
    route.fulfill(payload).catch(() => undefined);

/**
 * Hermetic network: every dependency of the app is served from repo
 * fixtures — the web server only provides the static bundle.
 */
export const intercept = async (page: Page): Promise<void> => {
  await page.route('**/api/stops', answer({ json: fixture('stops.json') }));
  await page.route('**/api/lines', answer({ json: fixture('lines.json') }));
  await page.route(
    '**/api/line-stops',
    answer({ json: fixture('line-stops.json') }),
  );
  await page.route(
    '**/api/geometry/**',
    answer({ json: fixture('geometry.json') }),
  );
  await page.route(
    '**/api/arrivals/**',
    answer({ json: fixture('arrivals.json') }),
  );
  await page.route('**/data/schedule.json', answer({ json: makeSchedule() }));
  await page.route(
    '**/data/bus-offsets.json',
    answer({ json: fixture('bus-offsets.json') }),
  );
  // Registration order matters: Playwright matches routes LAST
  // registered FIRST, so the catch-alls go before the specific
  // tiles.json — otherwise they shadow it and the style never loads.
  await page.route(
    'https://tiles.openfreemap.org/**',
    answer({ status: 204, body: '' }),
  );
  await page.route(
    'https://s3.amazonaws.com/**',
    answer({ status: 204, body: '' }),
  );
  await page.route(
    'https://tiles.openfreemap.org/planet**',
    answer({
      json: {
        tilejson: '3.0.0',
        tiles: ['https://tiles.openfreemap.org/t/{z}/{x}/{y}.pbf'],
        minzoom: 0,
        maxzoom: 14,
        vector_layers: [],
      },
    }),
  );
  await page.route(
    'https://mappe.comune.genova.it/**',
    answer({ json: fixture('wfs.json') }),
  );
  await page.route(
    'https://photon.komoot.io/**',
    answer({ json: { features: [] } }),
  );
  await page.route('https://api.transitous.org/**', answer({ json: makePlan() }));
};
