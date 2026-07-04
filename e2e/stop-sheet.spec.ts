import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

test('clicking the map on a stop opens its departure board', async ({
  page,
}) => {
  await boot(page);
  // Fixture stop 0001 sits exactly at the map center; the invisible
  // stops-hit layer gives it a finger-sized target (site AC-1.2).
  const canvas = page.locator('.maplibregl-canvas');
  await canvas.click({ position: { x: 500, y: 400 } });
  const sheet = page.getByTestId('stop-sheet');
  await expect(sheet).toBeVisible({ timeout: MAX_WAIT });
  await expect(page.getByTestId('stop-sheet-title')).toHaveText(
    /centro\/test/,
    { timeout: MAX_WAIT },
  );
});

test('the board separates live rows from ⚠ timetable rows', async ({
  page,
}) => {
  await boot(page);
  await page.locator('.maplibregl-canvas').click({ position: { x: 500, y: 400 } });
  const rows = page.getByTestId('board-row');
  await expect(rows.first()).toBeVisible({ timeout: MAX_WAIT });
  await expect(
    page.locator('[data-testid="board-row"][data-approximated="false"]').first(),
  ).toBeVisible({ timeout: MAX_WAIT });
  await expect(
    page.locator('[data-testid="board-row"][data-approximated="true"]').first(),
  ).toBeVisible({ timeout: MAX_WAIT });
  await expect(page.locator('.badge-full')).toBeVisible();
});

test('the close control dismisses the sheet', async ({ page }) => {
  await boot(page);
  await page.locator('.maplibregl-canvas').click({ position: { x: 500, y: 400 } });
  await expect(page.getByTestId('stop-sheet')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await page.getByTestId('stop-sheet-close').click();
  await expect(page.getByTestId('stop-sheet')).toHaveCount(0);
});
