import { expect, test, type Page } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

const planRoute = async (page: Page) => {
  await page.getByTestId('route-fab').click();
  await page.getByTestId('pick-origin').click();
  await page
    .locator('.maplibregl-canvas')
    .click({ position: { x: 420, y: 300 } });
  await page.getByTestId('pick-destination').click();
  await page
    .locator('.maplibregl-canvas')
    .click({ position: { x: 580, y: 520 } });
  await expect(page.getByTestId('route-sheet')).toBeVisible({
    timeout: MAX_WAIT,
  });
};

test('the itinerary collapses to a mini-bar and expands back', async ({
  page,
}) => {
  await boot(page);
  await planRoute(page);
  await page.getByTestId('route-sheet-collapse').click();
  // Collapsed: the full sheet is gone, the summary bar remains with
  // the times and line badges; the route stays on the map.
  await expect(page.getByTestId('route-sheet')).toHaveCount(0);
  const mini = page.getByTestId('route-mini');
  await expect(mini).toBeVisible();
  await expect(mini.locator('.line-badge').first()).toBeVisible();
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-route-legs',
    '3',
  );
  // Expanding restores the full description.
  await mini.click();
  await expect(page.getByTestId('route-sheet')).toBeVisible();
  await expect(page.getByTestId('route-leg')).toHaveCount(3);
});
