import { expect, type Page } from '@playwright/test';
import { intercept } from './intercept.ts';
import { MAX_WAIT } from './wait.ts';

/**
 * Open the app hermetically and gate on the DOM readiness contract:
 * <transit-map data-ready="true" data-stops="5"> means the style
 * loaded AND the stop data landed — no networkidle, no sleeps.
 */
export const boot = async (page: Page): Promise<void> => {
  await intercept(page);
  await page.goto('/');
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-ready',
    'true',
    { timeout: MAX_WAIT },
  );
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-stops',
    '5',
    { timeout: MAX_WAIT },
  );
  await expect(page.locator('transit-map')).toHaveAttribute(
    'data-stops-rendered',
    'true',
    { timeout: MAX_WAIT },
  );
};
