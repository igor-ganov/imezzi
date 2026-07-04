# live-map — tasks

- [ ] T1 Worker proxy routes `/api/stops`, `/api/lines`,
  `/api/line-stops`, `/api/geometry/:line/:dir`,
  `/api/arrivals/:stop`, `/api/trains/:station` with CSV/XML→JSON
  transforms + cache TTLs (design §1) — unit tests on transforms
  (fixtures), manual probe.
- [ ] T2 GTFS build script → `public/data/*` artifacts (design §3) —
  unit tests on parsers with fixture rows; artifact size budget.
- [ ] T3 Map island: base style per theme, sources/layers for stops +
  route lines (design §4) — manual browser check.
- [ ] T4 Arrivals lib: fetch, merge live + timetable rows, ⚠ flag,
  traffic delayFactor (US-3, US-4) — unit tests.
- [ ] T5 Stop sheet UI with live/⚠ rows, refresh loop (AC-3.1..3.4).
- [ ] T6 Vehicle inference: NumeroSociale correlation, polyline
  interpolation, RAF easing, ⚠ badge for Teorica/schedule modes
  (US-1) — unit tests on pure parts.
- [ ] T7 Line filter store + dock UI, highlight/dim feature-states
  (US-2) — unit tests on store; manual check.
- [ ] T8 Staleness banner (AC-4.2) — unit test on freshness store.
