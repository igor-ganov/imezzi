# site — tasks

- [x] T1 Scaffold Astro+Lit+Bun project, functional lint rules,
  strictest TS (AC-5.1 base) — verified by `bun run check`.
- [x] T2 Design tokens light/dark, theme boot script (AC-2.1) —
  `src/styles/global.css`, `src/layouts/Layout.astro`.
- [ ] T3 Full-viewport map shell + floating glass controls + noscript
  (AC-1.1..1.3) — e2e-style smoke via build + manual browser check.
- [ ] T4 Theme toggle island with circular reveal + map style swap
  (AC-2.2, 2.3) — unit test pref cycle; manual check.
- [ ] T5 RAF ticker + poll scheduler libs (AC-3.1, 3.3) — unit tests.
- [ ] T6 CI workflow: check → build → wrangler deploy with
  CLOUDFLARE_EMAIL/CLOUDFLARE_API_KEY secrets (AC-5.1, 5.2) —
  verified by green run + live URL.
