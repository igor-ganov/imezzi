import { defineConfig } from '@playwright/test';

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
  workers: process.env['CI'] ? 4 : undefined,
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
  webServer: {
    command: 'bunx wrangler dev --port 8791 --ip 127.0.0.1 --local',
    url: 'http://127.0.0.1:8791',
    reuseExistingServer: !process.env['CI'],
    timeout: 60000,
  },
});
