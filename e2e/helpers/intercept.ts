import type { Page } from '@playwright/test';
import { emptyStyle, fixture, makePlan, makeSchedule } from './fixtures.ts';

/**
 * Hermetic network: every dependency of the app is served from repo
 * fixtures — the wrangler server only provides the static bundle.
 */
export const intercept = async (page: Page): Promise<void> => {
  await page.route('**/api/stops', (route) =>
    route.fulfill({ json: fixture('stops.json') }),
  );
  await page.route('**/api/lines', (route) =>
    route.fulfill({ json: fixture('lines.json') }),
  );
  await page.route('**/api/line-stops', (route) =>
    route.fulfill({ json: fixture('line-stops.json') }),
  );
  await page.route('**/api/geometry/**', (route) =>
    route.fulfill({ json: fixture('geometry.json') }),
  );
  await page.route('**/api/arrivals/**', (route) =>
    route.fulfill({ json: fixture('arrivals.json') }),
  );
  await page.route('**/data/schedule.json', (route) =>
    route.fulfill({ json: makeSchedule() }),
  );
  await page.route('**/data/bus-offsets.json', (route) =>
    route.fulfill({ json: fixture('bus-offsets.json') }),
  );
  await page.route('https://tiles.openfreemap.org/styles/**', (route) =>
    route.fulfill({ json: emptyStyle() }),
  );
  await page.route('https://tiles.openfreemap.org/fonts/**', (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  await page.route('https://mappe.comune.genova.it/**', (route) =>
    route.fulfill({ json: fixture('wfs.json') }),
  );
  await page.route('https://photon.komoot.io/**', (route) =>
    route.fulfill({ json: { features: [] } }),
  );
  await page.route('https://api.transitous.org/**', (route) =>
    route.fulfill({ json: makePlan() }),
  );
};
