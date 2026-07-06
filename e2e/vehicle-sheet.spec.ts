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
  // a real UI tap. A MOVING marker can leave the hit zone between
  // projection and click (the CI-caught flake), so the probe samples
  // twice a frame apart and picks the STILLEST vehicle; the
  // project-then-click round retries against the sheet-open state.
  const sheet = page.getByTestId('vehicle-sheet');
  await expect(async () => {
    const at = await page.evaluate(async () => {
      const { map } = (window as unknown as ImezziBag).__imezzi;
      const sample = () =>
        new Map(
          map
            .queryRenderedFeatures({ layers: ['vehicles-hit'] })
            .filter((entry) => `${entry.properties['id']}`.startsWith('bus:'))
            .map((entry) => [
              `${entry.properties['id']}`,
              entry.geometry.coordinates,
            ]),
        );
      const first = sample();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 120));
      const second = sample();
      const stillest = [...second.entries()]
        .map(([id, coordinates]) => {
          const was = first.get(id) ?? coordinates;
          return {
            coordinates,
            drift: Math.hypot(
              coordinates[0] - was[0],
              coordinates[1] - was[1],
            ),
          };
        })
        .sort((a, b) => a.drift - b.drift)[0];
      const point = map.project(
        stillest?.coordinates ?? [8.9463, 44.4095],
      );
      return { x: point.x, y: point.y };
    });
    await page
      .locator('.maplibregl-canvas')
      .click({ position: { x: Math.round(at.x), y: Math.round(at.y) } });
    await expect(sheet).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: MAX_WAIT });
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
