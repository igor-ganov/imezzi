import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

interface ImezziBag {
  readonly __imezzi: {
    readonly map: {
      readonly queryRenderedFeatures: (
        options: Readonly<Record<string, readonly string[]>>,
      ) => readonly {
        readonly geometry: { readonly coordinates: readonly [number, number] };
        readonly properties: Readonly<Record<string, unknown>>;
      }[];
      readonly project: (
        at: readonly [number, number],
      ) => { readonly x: number; readonly y: number };
    };
  };
}

test('tapping a fleet icon opens its stop board with times', async ({
  page,
}) => {
  await boot(page);
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-live-rendered',
    /^[1-9]/,
    { timeout: MAX_WAIT },
  );
  // Project a rendered fleet icon to screen pixels and click THERE —
  // a real UI tap on a moving marker.
  const at = await page.evaluate(() => {
    const { map } = (window as unknown as ImezziBag).__imezzi;
    const feature = map
      .queryRenderedFeatures({ layers: ['vehicles-hit'] })
      .find((entry) => `${entry.properties['id']}`.startsWith('bus:'));
    const point = map.project(
      feature?.geometry.coordinates ?? [8.9463, 44.4095],
    );
    return { x: point.x, y: point.y };
  });
  await page
    .locator('.maplibregl-canvas')
    .click({ position: { x: Math.round(at.x), y: Math.round(at.y) } });
  const sheet = page.getByTestId('vehicle-sheet');
  await expect(sheet).toBeVisible({ timeout: MAX_WAIT });
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
