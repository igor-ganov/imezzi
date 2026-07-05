import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

const planRoute = async (page: import('@playwright/test').Page) => {
  await page.getByTestId('route-fab').click();
  await expect(page.getByTestId('route-panel')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await page.getByTestId('pick-origin').click();
  await page.locator('.maplibregl-canvas').click({ position: { x: 420, y: 300 } });
  await expect(page.getByTestId('pick-origin-value')).not.toHaveText('—', {
    timeout: MAX_WAIT,
  });
  await page.getByTestId('pick-destination').click();
  await page.locator('.maplibregl-canvas').click({ position: { x: 580, y: 520 } });
  await expect(page.getByTestId('route-sheet')).toBeVisible({
    timeout: MAX_WAIT,
  });
};

test('planning by map picks renders the itinerary sheet', async ({ page }) => {
  await boot(page);
  await planRoute(page);
  const legs = page.getByTestId('route-leg');
  await expect(legs).toHaveCount(3, { timeout: MAX_WAIT });
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-route-legs',
    '3',
  );
  // The metro leg has no live source — it keeps the ⚠ mark; the bus
  // leg is enriched from the arrivals fixture and turns live.
  await expect(
    page.locator('[data-testid="route-leg"][data-mode="metro"]'),
  ).toHaveAttribute('data-approximated', 'true');
  await expect(
    page.locator('[data-testid="route-leg"][data-mode="bus"]'),
  ).toHaveAttribute('data-approximated', 'false', { timeout: MAX_WAIT });
});

test('the sheet lists all alternatives as cards with line badges', async ({
  page,
}) => {
  await boot(page);
  await planRoute(page);
  const cards = page.getByTestId('route-alt-card');
  await expect(cards).toHaveCount(2, { timeout: MAX_WAIT });
  await expect(cards.first()).toHaveAttribute('aria-selected', 'true');
  // The first (active) alternative carries the bus 18 + metro badges.
  await expect(cards.first().locator('.line-badge')).toHaveCount(2);
  // Selecting the second card switches the active itinerary in place.
  await cards.nth(1).click();
  await expect(cards.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('route-leg')).toHaveCount(1, {
    timeout: MAX_WAIT,
  });
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-route-legs',
    '1',
  );
});

test('the planner panel folds away once the route is built', async ({
  page,
}) => {
  await boot(page);
  await planRoute(page);
  // The panel is an input surface — with a route on the map it must
  // not cover the screen; the FAB brings it back for edits.
  await expect(page.getByTestId('route-panel')).toHaveCount(0);
  await page.getByTestId('route-fab').click();
  await expect(page.getByTestId('route-panel')).toBeVisible();
});

test('clearing the route restores the normal map state', async ({ page }) => {
  await boot(page);
  await planRoute(page);
  await page.getByTestId('route-clear').click();
  await expect(page.getByTestId('route-sheet')).toHaveCount(0);
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-route-legs',
    '0',
    { timeout: MAX_WAIT },
  );
});
