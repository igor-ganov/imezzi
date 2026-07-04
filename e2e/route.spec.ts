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

test('alternatives switch the active itinerary', async ({ page }) => {
  await boot(page);
  await planRoute(page);
  const chips = page.getByTestId('alt-chip');
  await expect(chips).toHaveCount(2, { timeout: MAX_WAIT });
  await chips.nth(1).click();
  await expect(page.getByTestId('route-leg')).toHaveCount(1, {
    timeout: MAX_WAIT,
  });
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-route-legs',
    '1',
  );
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
