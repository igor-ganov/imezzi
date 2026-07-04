# site — requirements

## Overview

imezzi is a single-page live transit map of Genoa. This spec covers the
application shell: page frame, theming, performance envelope,
accessibility baseline, and deployment target. Feature behaviour lives
in sibling specs: `live-map`, `civic-addresses`, `route-planner`.

## US-1 App shell

As a visitor, I want the map to be the page, with controls floating
over it, so that on any device the map area is maximal.

- AC-1.1 WHEN the page loads THE SYSTEM SHALL render a full-viewport
  map with floating controls (search, mode filter, theme toggle) and no
  scrollable page body.
- AC-1.2 WHEN the viewport is narrower than 720px THE SYSTEM SHALL
  keep every control reachable (collapsed into sheets/FABs), with
  touch targets of at least 44×44 px.
- AC-1.3 WHEN JavaScript fails to load THE SYSTEM SHALL show a static
  explanation instead of a blank page.

## US-2 Theming

As a user, I want light and dark themes matching my system preference,
so that the map is comfortable day and night.

- AC-2.1 WHEN the page first paints THE SYSTEM SHALL already have the
  resolved theme applied (no flash of wrong theme).
- AC-2.2 WHEN the user activates the theme toggle THE SYSTEM SHALL
  cycle light → dark → system and persist the preference.
- AC-2.3 WHEN the theme changes THE SYSTEM SHALL switch the base map
  style (light/dark cartography) together with UI tokens.

## US-3 Performance

As a user on a mid-range phone, I want the map fluid, so that tracking
vehicles feels live.

- AC-3.1 THE SYSTEM SHALL keep vehicle-position animation off the main
  thread critical path: marker updates SHALL be driven by a single
  requestAnimationFrame loop over GPU-rendered layers (no per-vehicle
  DOM elements).
- AC-3.2 THE SYSTEM SHALL ship no blocking third-party scripts and no
  external fonts; initial JS for the shell (excluding the map engine)
  SHALL stay under 50 KB gzip.
- AC-3.3 WHEN data fetches fail THE SYSTEM SHALL degrade to the last
  known data with a visible staleness indicator, never a spinner-lock.

## US-4 Accessibility

- AC-4.1 All interactive controls SHALL be keyboard-operable with
  visible focus, labelled for screen readers, and meet WCAG AA
  contrast (AAA where the palette allows).
- AC-4.2 Live vehicle motion SHALL respect `prefers-reduced-motion`
  (positions jump instead of animating).

## US-5 Deployment

- AC-5.1 WHEN main is pushed THE SYSTEM SHALL run lint, typecheck and
  tests, build, and deploy to Cloudflare Workers (static assets +
  proxy worker) via CI.
- AC-5.2 The deploy SHALL authenticate with the account Global API Key
  (`cfk_` scannable format) as CLOUDFLARE_EMAIL + CLOUDFLARE_API_KEY.
