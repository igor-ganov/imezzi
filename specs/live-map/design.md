# live-map — design

Satisfies: live-map/requirements.md. Data facts verified 2026-07-04.

## 1. Data sources

| Data | Source | Access |
|---|---|---|
| Routes, stops, timetables (all modes: bus, metro `MM`, funicular/rack `FRI/FGR/ANN`, Casella rail `FGC`, Navebus `NVB`, ascensori) | AMT GTFS `https://www.amt.genova.it/amt/GTFS/GTFS_AMT_GENOVA.zip` (CC BY 4.0, no shapes.txt) | build-time script |
| Stop list w/ coords + `Monitored` flag | `amt/servizi/app/dati/app_stops.php` (CSV) | worker proxy |
| Line list, line→stop sequences | `app_lines.php`, `app_lines_stops.php` (CSV) | worker proxy |
| Route polylines | `amt/readxml_linea.php?file=<LLL>_<1|2>.xml` (XML markers + points) | worker proxy |
| Live arrivals per stop | `amt/servizi/passaggi_xml.php?CodiceFermata=<id>` — `<Previsione>` with `Linea`, `Destinazione`, `Teorica` (true = timetable, false = live SIMON prediction), `PrevisioneArrivo`, `NumeroSociale`, `AutobusPieno` | worker proxy, 15 s cache |
| Train boards (Principe, Brignole, suburban) | ViaggiaTreno `partenze/arrivi/andamentoTreno` (unofficial). Caveat found in production: Akamai denies requests from Cloudflare egress IPs, so the proxy route works only best-effort; scheduled rail still flows through GTFS/Transitous | worker proxy |

AMT hosts send no CORS headers → all AMT + ViaggiaTreno traffic goes
through `worker/` routes under `/api/*` with XML/CSV→JSON transforms
and `caches.default` TTLs (arrivals 15 s, geometry/lines 24 h, stops
1 h). Attribution "(C) AMT Genova, CC BY 4.0" on the map.

## 2. Vehicle positions (US-1)

No public vehicle-position feed exists. Positions are **inferred**:

1. Poll arrivals for the *monitored* stops of the lines in scope
   (selected lines, else lines visible in viewport; bounded to ≤6
   concurrent, rotating cycle ≈20 s).
2. Correlate the same `NumeroSociale` across consecutive stops of a
   line direction → the vehicle sits on the polyline segment between
   the last passed and next predicted stop.
3. Place it along `readxml_linea` geometry proportionally to
   countdown; RAF loop eases marker motion between polls (site
   AC-3.1).
4. `Teorica=true` predictions (and modes with no SIMON coverage:
   metro, funiculars, Casella, ascensori — confirmed no real-time)
   fall back to **timetable-positioned** vehicles from the GTFS
   schedule artifacts, marked ⚠ (AC-1.2).

Traffic awareness (AC-3.3): for a line with live predictions, compute
`delayFactor = live vs scheduled` at its monitored stops and apply it
to timetable-approximated values on the same line/segment; the ⚠
tooltip states "approximated from timetable + current traffic".

## 3. GTFS build artifacts

`scripts/build-gtfs.ts` (bun, run manually / CI cron) downloads the
zip and emits compact JSON under `public/data/`:

- `lines.json` — id, short/long name, mode (route_type patched for
  ascensori), colour hue;
- `stops.json` — id, name, lat/lon, monitored flag (joined with
  app_stops);
- `line-stops.json` — ordered stop ids per line+direction;
- `schedule/<line>.json` — per direction: trip templates (stop offset
  seconds) + departure times per service day (from calendar_dates).

Rejected shipping raw GTFS to the client (5.5 MB zip, 40k trips) and
rejected a database (static hosting; data is small once compacted).

## 4. Rendering (US-1, US-2)

MapLibre sources/layers:

- `vehicles` GeoJSON source → symbol layer (mode-coloured circle
  sprite + line number text + ⚠ badge via icon composition), updated
  by `setData` once per RAF frame;
- `route-lines` source → line layers (per-mode hue), with
  `highlighted`/`dimmed` feature-state driving opacity (filter mode,
  route mode);
- `stops` source → circle layer, zoom-gated; highlighted subset when
  a line filter is active.

Line filter state lives in a small store (plain signals module
`src/lib/store/`); islands subscribe. Filter UI: dock/bottom-sheet
listing lines grouped by mode with search (AC-2.3).

## 5. Stop popup (US-3)

Click stop → bottom sheet: list of `<Previsione>` rows (line badge,
destination, minutes, live dot or ⚠ icon, bus-full indicator), plus
timetable-approximated rows for lines without live rows (merged from
schedule artifacts, ⚠, traffic factor applied). Refresh every 15–20 s
while open (AC-3.4). Train stations show a ViaggiaTreno board instead.

## 6. Traceability

US-1 → `src/lib/vehicles/*` (inference, interpolation — unit-tested),
`src/components/transit-map*`; US-2 → `src/lib/store/filter.ts`,
`src/components/line-filter*`; US-3 → `src/lib/arrivals/*`,
`src/components/stop-sheet*`; US-4 → shared `src/lib/arrivals/merge.ts`
⚠ convention + staleness in `src/lib/store/freshness.ts`.
