# site — design

Satisfies: site/requirements.md (US-1..US-5).

## 1. Stack & hosting

Astro 5 `output: 'static'` + Lit islands + strict functional TS
(ESLint: no `if`/ternary, ≤50 code lines/file, one value export/file)
+ Bun. Same stack as liguria-events-site/blog — chosen for continuity
(US-5, user constraint). Map engine: **MapLibre GL JS** (WebGL vector
rendering). Rejected Leaflet (used in liguria): DOM markers cannot
animate hundreds of vehicles at 60 fps (AC-3.1); MapLibre renders
symbol layers on GPU from a GeoJSON source updated in place.

Hosting: Cloudflare Workers static assets (`wrangler.jsonc`,
`worker/index.ts`) — the worker also hosts `/api/*` proxy routes for
upstream APIs without CORS (see live-map design). Deploy auth uses the
account **Global API Key** (`cfk_` scannable format, works only with
`X-Auth-Email` + `X-Auth-Key` / `CLOUDFLARE_EMAIL` +
`CLOUDFLARE_API_KEY`; it is NOT a Bearer token — `/user/tokens/verify`
rejecting it is expected behaviour) (AC-5.2).

## 2. Base map

Vector tiles from **OpenFreeMap** (free, no key, no request cap,
`https://tiles.openfreemap.org/styles/liberty` + `/dark`), restyled to
the token palette at runtime (fog/water/roads tinted per theme). Theme
switch swaps the style with `map.setStyle` preserving our sources and
layers via a style-merge helper (AC-2.3). Rejected raster OSM tiles:
no dark variant, no smooth zoom, heavier repaint.

## 3. Design language — "harbour beacon"

Tokens in `src/styles/global.css`. Light = chart paper (warm
hsl(45…) surfaces, deep navy ink); dark = night navigation (deep sea
ink hsl(215 45% 8%), warm paper text). Accent = signal-lamp amber;
secondary = sea teal. Transit modes are HSL hue tokens
(`--mode-bus: 208`, metro 354, funicular 276, train 152, boat 190,
walk 35) driving chips, markers and route lines — same mechanic as
liguria's category hues. Civic colours: `--civic-black`/`--civic-red`.
Status: `--live` green, `--approx` amber (pairs with the ⚠
convention), `--danger` red.

Type: fluid `clamp()` steps, system fonts only (AC-3.2). Surfaces:
soft rounded cards, glass panels (`backdrop-filter: blur(12px)
saturate(1.4)`) floating over the map. Motion: 160 ms ease,
circular-reveal theme transition (View Transitions), all gated by
`prefers-reduced-motion` (AC-4.2).

## 4. Shell layout

Full-viewport map (`100dvh`, no body scroll — AC-1.1). Floating
elements, all glass surfaces:

- top-left: search pill (address/line search, expands to results
  panel);
- top-right: theme toggle + locate-me;
- bottom-left: mode/line filter dock (desktop) or FAB opening a
  bottom sheet (mobile — AC-1.2);
- bottom sheet: stop popup / itinerary list share one sheet component.

`<noscript>` block explains the app needs JS (AC-1.3). Islands are
client-only Lit custom elements (never SSR'd), light-DOM where they
style global map chrome, shadow-DOM for self-contained widgets.

## 5. Update loop (perf, AC-3.1)

One `requestAnimationFrame` ticker interpolates vehicle positions
between API polls and calls `GeoJSONSource.setData` once per frame at
most. Data fetch on a poll timer (per-source cadence), decoupled from
rendering. All computation in pure functions under `src/lib/**`
(unit-tested); islands stay imperative shells.

## 6. CI/CD (US-5)

GitHub Actions on push to main: `bun run check` (lint + astro check +
tsc + bun test) → `bun run build` → `wrangler deploy` with
`CLOUDFLARE_EMAIL`/`CLOUDFLARE_API_KEY` repo secrets. Concurrency
group per-ref with cancel-in-progress, least-privilege
`contents: read`.
