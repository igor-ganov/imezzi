# route-planner — tasks

- [x] T1 Transitous plan client + itinerary model (AC-2.1, 2.3) —
  polyline decoder, mode mapper, itinerary mapper unit-tested.
- [x] T2 Origin handling: geolocation, map-click pick, search pick
  (US-1) — planner panel with pick-on-map mode.
- [x] T3 Leg enrichment with live arrivals + ⚠ (AC-2.2) — unit tests
  incl. the too-early-bus window guard [-3, +15] min.
- [x] T4 Route mode: highlight itinerary, dim stops and vehicles,
  poll itinerary bus lines (US-3) — verified in browser.
- [x] T5 Route sheet list view, leg → fitBounds, alternatives chips
  (US-4) — verified: De Ferrari → Brin, 5 alternatives, live bus
  legs green, metro leg ⚠.
