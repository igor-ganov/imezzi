# route-planner — design

Satisfies: route-planner/requirements.md.

## 1. Routing engine

**Transitous** (`https://api.transitous.org/api/v1/plan`, MOTIS 2,
CORS `*`, no key, fair-use) — already ingests the AMT GTFS feed
(`it-Liguria-Genova`), plans multimodal door-to-door journeys
(walk + bus/metro/funicular/rail incl. Trenitalia) over OSM footpaths
(AC-2.1). Called directly from the browser.

Rejected alternatives: client-side RAPTOR over our GTFS artifacts
(weeks of work, no OSM footpath graph); OpenTripPlanner self-hosted
(no server budget on a static Workers deploy); Valhalla/OSRM (no
transit).

Walking-only fallback: same endpoint with direct modes only (AC-2.3).

## 2. Flow

1. Origin: geolocation watch (AC-1.1) or map click / search pick.
2. Destination: civic-aware search (civic-addresses US-2) or map
   click (AC-1.2).
3. `plan(origin, destination, now)` → itineraries; the first is
   active, alternatives listed.
4. Leg enrichment: for transit legs at monitored AMT stops, overlay
   live arrival predictions from `/api/arrivals/:stop` — matching
   line + headsign within ±10 min replaces the scheduled time and
   marks the leg live; otherwise the leg keeps timetable times +
   traffic factor and carries ⚠ (AC-2.2, live-map ⚠ convention).

## 3. Route mode on the map (US-3)

Entering route mode sets store state `route`:
- itinerary geometry drawn on a dedicated `route` source (per-mode
  hues, walk legs dashed);
- stops of the itinerary highlighted; all other stops hidden;
- vehicle layer filter: vehicles whose line+direction serves an
  itinerary leg keep full opacity, all others drop to 0.15 ("dimmed"
  feature-state) — same mechanism as line filtering (live-map §4);
- clearing the route resets feature-states (AC-3.2).

## 4. Itinerary list (US-4)

`route-sheet` island in the shared bottom sheet: ordered legs — walk
(distance, minutes), board (stop, line badge, departure, live/⚠),
ride (n stops, duration), alight. Click leg → `fitBounds` its
geometry (AC-4.2). On mobile the sheet is draggable half/full
(AC-4.3).

## 5. Traceability

AC-1.x → `src/lib/route/origin.ts`, geolocation island;
AC-2.x → `src/lib/route/plan.ts`, `enrich-legs.ts` (+ unit tests);
AC-3.x → `src/lib/store/route.ts`, map feature-state updaters;
AC-4.x → `src/components/route-sheet*`.
