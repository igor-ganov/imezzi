import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

// Clicking the map at a moving marker's projected pixel is a race by
// construction (the CI-caught flake) — the deterministic UI path to
// a vehicle is its LIVE row on a stop board.
test('a live board row opens its vehicle sheet with times', async ({
  page,
}) => {
  await boot(page);
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-live-rendered',
    /^[1-9]/,
    { timeout: MAX_WAIT },
  );
  await page
    .locator('.maplibregl-canvas')
    .click({ position: { x: 500, y: 400 } });
  await expect(page.getByTestId('stop-sheet')).toBeVisible({
    timeout: MAX_WAIT,
  });
  // Live rows are buttons bound to their NumeroSociale; ⚠ rows are
  // disabled (no physical vehicle to show).
  const liveRow = page
    .locator('[data-testid="board-row"][data-approximated="false"]')
    .first();
  await expect(liveRow).toBeEnabled({ timeout: MAX_WAIT });
  await liveRow.click();
  const sheet = page.getByTestId('vehicle-sheet');
  await expect(sheet).toBeVisible({ timeout: MAX_WAIT });
  await expect(page.getByTestId('stop-sheet')).toHaveCount(0);
  // The board lists the remaining stops with a wait and an arrival
  // clock stamp.
  const rows = page.getByTestId('vehicle-stop-row');
  await expect(rows.first()).toBeVisible({ timeout: MAX_WAIT });
  await expect(rows.first()).toContainText('min');
  await expect(rows.first()).toContainText(/\d{2}:\d{2}/);
  // Closing clears both the sheet and the selection ring.
  await page.getByTestId('vehicle-sheet-close').click();
  await expect(sheet).toHaveCount(0);
});
