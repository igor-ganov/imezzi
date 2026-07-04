# civic-addresses — tasks

- [x] T1 Civic libs: `parse-civic-query`, `expand-street-variants`,
  `build-cql`, `tiles-in-bbox` (AC-2.1, 2.3, 1.3) — unit tests.
- [x] T2 WFS client with bbox loading + session cache (AC-1.3) —
  grid-cell loader, verified against the live GeoServer (lon,lat
  bbox axis order).
- [x] T3 Map layer: red/black symbols at z≥16.5, click card, CC BY
  attribution (AC-1.1, 1.2, 3.1) — verified in browser.
- [x] T4 Search island: official WFS lookup → Photon fallback, flyTo
  + coloured pin (AC-2.2, 2.4) — verified: `Via XX Settembre 20r`
  resolves to the official red civic on VIA VENTI SETTEMBRE.
