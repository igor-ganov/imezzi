import { defineConfig } from 'astro/config';

// Cloudflare Workers static-assets deploy — served from the domain root,
// so no `base` prefix (design §1). Single-page map app, statically built.
export default defineConfig({
  site: 'https://imezzi.igor-ganov.workers.dev',
  output: 'static',
  i18n: {
    locales: ['en', 'it', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
});
