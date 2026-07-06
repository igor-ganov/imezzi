import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

// Animation-independent state contract: with reduced motion the app
// must skip the reveal (a11y) — the pref cycle itself is what this
// spec pins down. The reveal path is covered by the overlay
// pointer-events fix + manual observation.
test.use({ colorScheme: 'light', reducedMotion: 'reduce' });

test('theme starts on system and cycles light → dark → system', async ({
  page,
}) => {
  await boot(page);
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveAttribute('data-theme-pref', 'system');
  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-theme-pref', 'light', {
    timeout: MAX_WAIT,
  });
  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-theme-pref', 'dark');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await page.getByTestId('theme-toggle').click();
  await expect(root).toHaveAttribute('data-theme-pref', 'system');
  await expect(root).toHaveAttribute('data-theme', 'light');
});

test('the stored preference survives a reload', async ({ page }) => {
  await boot(page);
  await page.getByTestId('theme-toggle').click();
  await page.getByTestId('theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark', {
    timeout: MAX_WAIT,
  });
  await page.reload();
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: MAX_WAIT },
  );
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme-pref', 'dark');
});
