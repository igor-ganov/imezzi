import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

test('searching a stop by name opens its board', async ({ page }) => {
  await boot(page);
  await page.getByTestId('search-input').fill('caricamento');
  const hit = page.getByTestId('search-hit-stop').first();
  await expect(hit).toBeVisible({ timeout: MAX_WAIT });
  await expect(hit).toContainText(/caricamento/);
  await hit.click();
  await expect(page.getByTestId('stop-sheet')).toBeVisible({
    timeout: MAX_WAIT,
  });
  await expect(page.getByTestId('stop-sheet-title')).toHaveText(
    /caricamento\/acquario/,
    { timeout: MAX_WAIT },
  );
});

test('a red civic query resolves to the official 20r address', async ({
  page,
}) => {
  await boot(page);
  await page.getByTestId('search-input').fill('Via XX Settembre 20r');
  const hit = page.getByTestId('search-hit-civic').first();
  await expect(hit).toBeVisible({ timeout: MAX_WAIT });
  await expect(hit).toContainText('Via Venti Settembre 20r');
  await hit.click();
  const card = page.getByTestId('civic-card');
  await expect(card).toBeVisible({ timeout: MAX_WAIT });
  await expect(card).toContainText('Red number');
  await expect(card).toContainText('Centro est');
  await page.getByTestId('civic-card-close').click();
  await expect(card).toHaveCount(0);
});
