/**
 * Static server for E2E: serves dist/ only. The hermetic Playwright
 * suite intercepts every API/data request with fixtures, so the
 * heavyweight wrangler dev (which flakes under parallel load) is
 * not needed — only the built bundle is.
 * Run: `bun scripts/serve-dist.ts [port]`.
 */
const port = Number(Bun.argv[2] ?? '8791');

const resolve = (pathname: string): string =>
  ({ true: '/index.html', false: pathname })[`${pathname === '/'}`] ?? '';

Bun.serve({
  port,
  // Loopback only: binding 0.0.0.0 collides with OUTBOUND sockets
  // whose ephemeral local port happens to match (observed live: an
  // established connection at :8791 blocked the listen).
  hostname: '127.0.0.1',
  fetch: async (request) => {
    const url = new URL(request.url);
    const file = Bun.file(`dist${resolve(url.pathname)}`);
    const exists = await file.exists();
    return {
      true: () => new Response(file),
      false: () => new Response('not found', { status: 404 }),
    }[`${exists}`]();
  },
});

console.log(`serving dist/ on http://127.0.0.1:${port}`);
