# civic-addresses — design

Satisfies: civic-addresses/requirements.md.

## 1. Data source

Comune di Genova GeoServer WFS (verified live, CORS `*`, rate limit 6
concurrent):

```
https://mappe.comune.genova.it/geoserver/ows?service=WFS&version=2.0.0
  &request=GetFeature&typeNames=MEDIATORE:V_CIVICI_DBT_ANGOLO_GEOSERVER
  &outputFormat=application/json&srsName=EPSG:4326
```

Fields used: `DESVIA` (street), `NUMERO` (zero-padded), `LETTERA`,
`COLORE` (`R`|null), `TESTO` (display, e.g. `20r`, `12A`),
`NOME_MUNICIPIO`, point geometry. License CC BY 4.0 → attribution
string on the layer (AC-3.1).

## 2. Map layer (US-1)

Browser calls WFS directly (CORS is open) with `bbox=` filter per
viewport at zoom ≥ 17 (AC-1.3). Fetched cells cached in-memory keyed
by a coarse tile key (z17 grid) for the session. Rendered as a
MapLibre symbol layer: circle + `TESTO` label, colour by `COLORE`
(`--civic-red` / `--civic-black` resolved per theme). Click →
bottom-sheet card with street, number, colour semantics, municipio
(AC-1.2).

Rejected: shipping the full 133k GeoJSON (~40 MB) or pre-baked
PMTiles — bbox WFS is simpler, always current, and zoom-gating keeps
request volume tiny; revisit PMTiles only if the endpoint proves
unreliable.

## 3. Search (US-2)

Pure-function pipeline in `src/lib/civic/`:

1. `normalize-query.ts` — lowercase, strip accents, collapse spaces;
   rewrite `(\d+)\s*r(?:\.|osso)?\b` → number + `red` flag (AC-2.1).
2. `expand-street-variants.ts` — Roman/spelled numerals (`xx` ↔
   `venti`), common abbreviations (`v.` → `via`).
3. WFS query by `CQL_FILTER=DESVIA ILIKE '%…%' AND NUMERO='…'`
   (+ `COLORE='R'` when red) — exact civic lookup.
4. Fallback: Photon (`photon.komoot.io`) with `… rosso Genova`
   normalised form (AC-2.4). OSM tags red civics as
   `addr:housenumber=20 rosso` — verified; `20r` fails un-normalised.

Result selection flies the map (`flyTo`) and drops a pin coloured by
civic type (AC-2.2).

## 4. Traceability

- AC-1.1/1.2/1.3 → `src/components/civic-layer*`,
  `src/lib/civic/tile-key.ts`, tests `test/civic/*.test.ts`.
- AC-2.1..2.4 → `src/lib/civic/normalize-query.ts`,
  `expand-street-variants.ts`, `build-cql.ts` + unit tests per file.
