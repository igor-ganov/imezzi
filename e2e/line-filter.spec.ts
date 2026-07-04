import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

test('selecting a line filters the network and counts on the FAB', async ({
  page,
}) => {
  await boot(page);
  await page.getByTestId('filter-fab').click();
  await expect(page.getByTestId('filter-dock')).toBeVisible({
    timeout: MAX_WAIT,
  });
  const item = page.locator('[data-testid="filter-line-item"][data-line-key="001-00"]');
  await item.click();
  await expect(item).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByTestId('filter-count')).toHaveText('1', {
    timeout: MAX_WAIT,
  });
  // Targeted polling for the selected line infers live buses from
  // the arrivals fixture (NumeroSociale 09001/09002).
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-vehicles',
    /^[1-9]\d*$/,
    { timeout: MAX_WAIT },
  );
});

test('search narrows the dock and clear resets the selection', async ({
  page,
}) => {
  await boot(page);
  await page.getByTestId('filter-fab').click();
  await page.getByTestId('filter-search').fill('est');
  const items = page.getByTestId('filter-line-item');
  await expect(items).toHaveCount(1, { timeout: MAX_WAIT });
  await expect(items.first()).toContainText('Est');
  await page.getByTestId('filter-search').fill('');
  await items.first().click();
  await page.getByTestId('filter-clear').click();
  await expect(page.getByTestId('filter-count')).toHaveCount(0);
});
