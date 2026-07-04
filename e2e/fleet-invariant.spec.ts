import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

// The contract this product stands on: every unique vehicle present
// in the raw per-stop predictions must be drawn on the map — the
// computed fleet size and the rendered live-marker count are exposed
// as attributes and MUST be equal.
test('every unique vehicle in the data becomes exactly one marker', async ({
  page,
}) => {
  await boot(page);
  const map = page.locator('transit-map');
  // The arrivals fixture carries three unique NumeroSociale values
  // (09001, 09002 on line 1; 09777 on line 9) at every polled stop.
  await expect(map).toHaveAttribute('data-fleet-computed', '3', {
    timeout: MAX_WAIT,
  });
  await expect(map).toHaveAttribute('data-live-rendered', '3', {
    timeout: MAX_WAIT,
  });
});

test('the invariant survives sweep refreshes', async ({ page }) => {
  await boot(page);
  const map = page.locator('transit-map');
  await expect(map).toHaveAttribute('data-fleet-computed', '3', {
    timeout: MAX_WAIT,
  });
  // Wait through another poll tick: counts must stay equal, not drift.
  await expect(async () => {
    const computed = await map.getAttribute('data-fleet-computed');
    const rendered = await map.getAttribute('data-live-rendered');
    expect(computed).toBe(rendered);
    expect(Number(computed)).toBeGreaterThan(0);
  }).toPass({ timeout: MAX_WAIT });
});
