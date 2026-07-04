# live-map — tasks

- [x] T1 Worker proxy routes `/api/stops`, `/api/lines`,
  `/api/line-stops`, `/api/geometry/:line/:dir`,
  `/api/arrivals/:stop`, `/api/trains/:station` with CSV/XML→JSON
  transforms + cache TTLs (design §1) — parser unit tests on live
  fixtures; probed locally and in production. Note: ViaggiaTreno
  denies Cloudflare egress IPs (best effort).
- [x] T2 GTFS build script → `public/data/*` artifacts (design §3) —
  17 non-bus lines, 24 KB schedule.json; CI rebuilds on deploy.
- [x] T3 Map island: base style per theme, sources/layers for stops +
  route lines (design §4) — verified in browser.
- [x] T4 Arrivals lib: fetch, merge live + timetable rows, ⚠ flag
  (US-3, US-4) — unit tests. Traffic delayFactor for timetable rows
  still open (AC-3.3 partial: live rows already reflect traffic).
- [x] T5 Stop sheet UI with live/⚠ rows, refresh loop (AC-3.1..3.4).
- [x] T6 Vehicle inference: NumeroSociale correlation, polyline
  interpolation, ⚠ badge for Teorica/schedule modes (US-1) — unit
  tests on pure parts; RAF easing between polls still open.
- [x] T7 Line filter store + dock UI, highlight/dim feature-states
  (US-2) — verified in browser with line 1 (11 live buses).
- [ ] T8 Staleness banner (AC-4.2) — stop sheet shows staleness; the
  global banner is not built yet.
