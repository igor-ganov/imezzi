import { defineConfig } from '@playwright/test';
import os from 'node:os';

/**
 * Hermetic E2E: the web server serves the built site + worker proxy,
 * but every network dependency (own /api, /data, map tiles, WFS,
 * Photon, Transitous) is intercepted per-test with repo fixtures —
 * zero reliance on live upstreams. Retries are 0: a flake is a race.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  // One software-WebGL page saturates ~4 cores while compiling the
  // basemap; workers are budgeted to that, not to core count / 2 —
  // oversubscription starves every page into false timeouts.
  workers: process.env['CI'] ? 4 : Math.max(2, Math.floor(os.cpus().length / 4)),
  // Cold boot compiles the full basemap under software WebGL when
  // workers run in parallel — the per-test budget must exceed the
  // wait ceiling (E2E_MAX_WAIT_MS) with room for the test body.
  timeout: 60000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:8791',
    viewport: { width: 1000, height: 800 },
    launchOptions: {
      // Headless Chromium on this hardware loses the WebGL context
      // mid-boot (ANGLE on the real GPU), which makes MapLibre abort
      // its style load. Software WebGL is deterministic everywhere.
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  // Static bundle only: the suite intercepts every API/data call, so
  // no worker runtime is involved (wrangler dev flakes under load).
  webServer: {
    command: 'bun scripts/serve-dist.ts 8791',
    url: 'http://127.0.0.1:8791',
    reuseExistingServer: !process.env['CI'],
    timeout: 30000,
  },
});
