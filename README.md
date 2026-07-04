# imezzi

Live transit map of Genoa: [imezzi.igor-ganov.workers.dev](https://imezzi.igor-ganov.workers.dev)

Buses, metro, funiculars, public lifts, Navebus and the Casella
railway on one map — with the city's red/black civic numbering and
door-to-door route planning.

## What it does

- **Live vehicles.** AMT publishes no vehicle-position feed, so bus
  positions are inferred from the SIMON per-stop predictions
  (`passaggi_xml.php`): the same fleet number seen across a line's
  stops is placed along the route polyline by its countdown. Modes
  without live coverage (metro, funiculars, lifts, Navebus, Casella)
  run on timetable positions and carry an amber `!` badge — the same
  approximation mark used everywhere in the UI.
- **Stops.** Click a stop for its departure board: live rows (green
  dot) merged with timetable rows (`!`), bus-full flags, 20 s refresh.
- **Line filter.** Pick lines to draw their geometry, dim the rest of
  the network and start live polling for them.
- **Red/black civics.** Genoa numbers homes in black and businesses
  in red (`20r`), two independent sequences per street. The official
  Comune WFS layer (133k points, CC BY 4.0) streams in at street
  zooms; search understands `20r` / `20 rosso` and roman-numeral
  street names (`XX Settembre` → `VENTI SETTEMBRE`), with an OSM
  Photon fallback.
- **Route planner.** Door-to-door itineraries (walk + all transit
  modes) via [Transitous](https://transitous.org), which ingests the
  AMT GTFS feed. Active routes highlight their geometry and vehicles,
  dim everything else, and show a leg-by-leg sheet; live SIMON
  predictions replace scheduled departures where available.

## Stack

Astro 5 (static) + Lit islands + MapLibre GL + Bun, deployed as
Cloudflare Workers static assets with a `/api/*` proxy worker for the
upstreams that lack CORS (AMT, ViaggiaTreno). Strict functional
TypeScript enforced by lint: no `if`/ternaries, one exported value
per file, ≤50 code lines per file.

## Develop

```sh
bun install
bun run data     # build GTFS artifacts into public/data/
bun run build    # astro build into dist/
bunx wrangler dev --port 8787   # site + API proxy locally
bun run check    # lint + typecheck + unit tests
```

Specs live in `specs/<feature>/{requirements,design,tasks}.md`.

## Data sources

© AMT Genova (GTFS + SIMON, CC BY 4.0) · © Comune di Genova (civic
numbers, CC BY 4.0) · © OpenStreetMap contributors via OpenFreeMap ·
Transitous (MOTIS) · ViaggiaTreno (best effort; blocked from some
datacenter IPs).
