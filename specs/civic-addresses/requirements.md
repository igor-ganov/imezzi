# civic-addresses — requirements

## Overview

Genoa uses dual civic numbering ("doppia numerazione"): black numbers
(neri) for residential entrances and red numbers (rossi, written
`20r` / `20 rosso`) for commercial premises, running as independent
sequences on the same street. The map must show, distinguish, and
search these civics. Authoritative source: Comune di Genova WFS layer
`MEDIATORE:V_CIVICI_DBT_ANGOLO_GEOSERVER` (133 222 points, field
`COLORE` = `R` | null, CC BY 4.0).

## US-1 Civic layer on the map

As a user, I want to see house numbers with their colour on the map,
so that I can find a red address that generic maps miss.

- AC-1.1 WHEN zoomed to street level (zoom ≥ 17) THE SYSTEM SHALL
  display civic number points styled black (neri) and red (rossi)
  matching the official colours in both themes.
- AC-1.2 WHEN a civic point is clicked THE SYSTEM SHALL show street
  name, display number (e.g. `20r`, `12A`), colour meaning
  (residential/commercial), and municipio.
- AC-1.3 The layer SHALL load per viewport (bounding-box requests),
  never the full 133k dataset at once, and SHALL cache fetched tiles
  for the session.

## US-2 Address search

As a user, I want to type a Genoa address in its local form, so that
`Via XX Settembre 20r` finds the red door, not the black one.

- AC-2.1 WHEN the query contains a red suffix (`20r`, `20 r.`,
  `20 rosso`) THE SYSTEM SHALL normalise it and match only red civics;
  without a suffix it SHALL prefer black civics but also list red
  homonyms.
- AC-2.2 WHEN a result is chosen THE SYSTEM SHALL fly the map to it
  and drop a labelled pin showing the civic colour.
- AC-2.3 Search SHALL tolerate street-name variants (VIA XX SETTEMBRE
  vs Via Venti Settembre; missing accents; case).
- AC-2.4 IF the official dataset has no match THEN THE SYSTEM SHALL
  fall back to OSM geocoding (Nominatim/Photon) with the `rosso`
  normalisation applied.

## US-3 Attribution

- AC-3.1 THE SYSTEM SHALL attribute "Comune di Genova — CC BY 4.0"
  when the civic layer is visible.
