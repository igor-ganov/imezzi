import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

test.describe('granted', () => {
  test.use({
    permissions: ['geolocation'],
    geolocation: { latitude: 44.4095, longitude: 8.9463 },
  });

  test('locating drops the blue dot and centers the map', async ({
    page,
  }) => {
    await boot(page);
    await page.getByTestId('locate-button').click();
    // The position lands in the store and renders as the me layer;
    // no toast for an in-area fix.
    await expect(page.getByTestId('locate-toast')).toHaveCount(0);
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const state = (
              window as unknown as {
                __imezzi: {
                  appState: {
                    mePosition: { get: () => { lat: number } | undefined };
                  };
                };
              }
            ).__imezzi.appState;
            return state.mePosition.get()?.lat;
          }),
        { timeout: MAX_WAIT },
      )
      .toBeCloseTo(44.4095, 4);
  });

  test('an out-of-area fix shows the outside toast', async ({ page, context }) => {
    await context.setGeolocation({ latitude: 52.52, longitude: 13.4 });
    await boot(page);
    await page.getByTestId('locate-button').click();
    await expect(page.getByTestId('locate-toast')).toBeVisible({
      timeout: MAX_WAIT,
    });
    await expect(page.getByTestId('locate-toast')).toContainText(
      'outside the map area',
    );
  });
});

test.describe('denied', () => {
  // No permissions granted: headless Chromium auto-denies the prompt,
  // which is exactly the blocked-permission path.
  test('the blocked state is shown, the button stays usable', async ({
    page,
  }) => {
    await boot(page);
    await page.getByTestId('locate-button').click();
    await expect(page.getByTestId('locate-toast')).toBeVisible({
      timeout: MAX_WAIT,
    });
    await expect(page.getByTestId('locate-toast')).toContainText('blocked');
    await expect(page.getByTestId('locate-button')).toBeEnabled();
  });
});
