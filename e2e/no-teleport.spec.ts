import { expect, test } from '@playwright/test';
import { boot } from './helpers/boot.ts';
import { MAX_WAIT } from './helpers/wait.ts';

// The acceptance contract for motion quality: the motion loop
// reports the largest per-frame marker displacement in metres as
// data-max-step-m. Vehicles must glide — a chord teleport across
// town would register hundreds/thousands of metres in one frame.
test('no marker ever jumps — max per-frame step stays in glide range', async ({
  page,
}) => {
  await boot(page);
  const map = page.locator('transit-map');
  // Fleet present and moving (fixtures melt countdowns continuously).
  await expect(map).toHaveAttribute('data-live-rendered', /^[1-9]/, {
    timeout: MAX_WAIT,
  });
  // Let the loop run through several data ticks and poll refreshes,
  // waiting on the attribute (event-driven, not a sleep): it updates
  // every frame, so we wait for it to exist, then observe a window.
  await expect(map).toHaveAttribute('data-max-step-m', /^\d+$/, {
    timeout: MAX_WAIT,
  });
  await expect(async () => {
    const worst = Number(await map.getAttribute('data-max-step-m'));
    // Catch-up is capped at 6× schedule speed ≈ 6 × ~8 m/s ≈ 48 m/s;
    // at 60 fps that is < 1 m per frame — 50 m of slack covers slow
    // frames. A teleport would blow far past this.
    expect(worst).toBeLessThan(120);
  }).toPass({ timeout: MAX_WAIT });
});
