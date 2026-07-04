import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

test('map boots with canvas, chrome controls and stop data', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await boot(page);
  await expect(page.locator('.maplibregl-canvas')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await expect(page.getByTestId('search-input')).toBeVisible();
  await expect(page.getByTestId('theme-toggle')).toBeVisible();
  await expect(page.getByTestId('filter-fab')).toBeVisible();
  await expect(page.getByTestId('route-fab')).toBeVisible();
  expect(errors).toEqual([]);
});

test('schedule vehicles appear without any interaction', async ({ page }) => {
  await boot(page);
  // The metro fixture departs every 5 min all day — the vehicles
  // attribute must leave zero as soon as the schedule artifact lands.
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-vehicles',
    /^[1-9]\d*$/,
    { timeout: MAX_WAIT },
  );
});
