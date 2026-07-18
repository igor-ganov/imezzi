import { expect, type Locator, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

// Animation-independent state contract: with reduced motion the app
// must skip the reveal (a11y) — the pref cycle itself is what this
// spec pins down. The reveal path is covered by the overlay
// pointer-events fix + manual observation.
test.use({ colorScheme: 'light', reducedMotion: 'reduce' });

// Each theme switch triggers a full map.setStyle; on the CI software
// GL that stalls the main thread for seconds, and a click issued into
// that churn lands on the re-rendering button and is dropped (the
// resolved click never ran its handler). Advance idempotently: click
// only while the pref has not yet reached its target, so a lost click
// retries but a landed one never over-cycles.
const advanceTo = async (root: Locator, toggle: Locator, pref: string): Promise<void> => {
  await expect(async () => {
    const current = await root.getAttribute('data-theme-pref');
    await Promise.all(current === pref ? [] : [toggle.click()]);
    await expect(root).toHaveAttribute('data-theme-pref', pref, { timeout: 2000 });
  }).toPass({ timeout: MAX_WAIT });
};

test('theme starts on system and cycles light → dark → system', async ({
  page,
}) => {
  await boot(page);
  const root = page.locator('html');
  const toggle = page.getByTestId('theme-toggle');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveAttribute('data-theme-pref', 'system');
  await advanceTo(root, toggle, 'light');
  await advanceTo(root, toggle, 'dark');
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await advanceTo(root, toggle, 'system');
  await expect(root).toHaveAttribute('data-theme', 'light');
});

test('the stored preference survives a reload', async ({ page }) => {
  await boot(page);
  const root = page.locator('html');
  const toggle = page.getByTestId('theme-toggle');
  await advanceTo(root, toggle, 'light');
  await advanceTo(root, toggle, 'dark');
  await expect(root).toHaveAttribute('data-theme', 'dark', { timeout: MAX_WAIT });
  await page.reload();
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: MAX_WAIT },
  );
  await expect(root).toHaveAttribute('data-theme', 'dark');
  await expect(root).toHaveAttribute('data-theme-pref', 'dark');
});
