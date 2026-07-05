import { expect, test, type Page } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

const destinationValue = (page: Page) =>
  page.getByTestId('pick-destination-value');

test('route-here from a stop board sets the destination', async ({
  page,
}) => {
  await boot(page);
  await page
    .locator('.maplibregl-canvas')
    .click({ position: { x: 500, y: 400 } });
  await expect(page.getByTestId('stop-sheet')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await page.getByTestId('stop-sheet-route').click();
  // The stop sheet closes, the planner opens with the stop as "To".
  await expect(page.getByTestId('stop-sheet')).toHaveCount(0);
  await expect(page.getByTestId('route-panel')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await expect(destinationValue(page)).not.toHaveText('—');
});

test('route-here from a civic card sets the address destination', async ({
  page,
}) => {
  await boot(page);
  await page.getByTestId('search-input').fill('Via XX Settembre 20r');
  await page.getByTestId('search-hit-civic').first().click();
  await expect(page.getByTestId('civic-card')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await page.getByTestId('civic-card-route').click();
  await expect(page.getByTestId('civic-card')).toHaveCount(0);
  await expect(page.getByTestId('route-panel')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await expect(destinationValue(page)).toContainText('20', {
    timeout: MAX_WAIT,
  });
});

test('right-click on the map routes to the tapped point', async ({
  page,
}) => {
  await boot(page);
  await page
    .locator('.maplibregl-canvas')
    .click({ position: { x: 300, y: 300 }, button: 'right' });
  await expect(page.getByTestId('route-panel')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await expect(destinationValue(page)).toContainText('Pinned point');
});
