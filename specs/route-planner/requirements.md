# route-planner — requirements

## Overview

Door-to-door multimodal routing inside Genoa: from the user's
geolocation (or a picked point) to an address (civic-aware search) or
a map point, combining walking with AMT buses, metro,
funiculars/rack railways and commuter rail. The planned route drives a
focused map mode and a list (itinerary) view.

## US-1 Route input

- AC-1.1 WHEN the user grants geolocation THE SYSTEM SHALL use the
  current position as the default origin; otherwise origin SHALL be
  settable by map click or address search.
- AC-1.2 The destination SHALL be settable by address search
  (civic-aware, see civic-addresses US-2) or by map click.

## US-2 Route computation

- AC-2.1 WHEN origin and destination are set THE SYSTEM SHALL compute
  at least one itinerary combining walking and scheduled transit
  (bus, metro, funicular, train), using timetable data and street/
  footpath geometry.
- AC-2.2 WHEN real-time data affects the itinerary (delays, live
  positions) THE SYSTEM SHALL adjust predicted leg times; legs that
  rely on timetable approximation SHALL carry the ⚠ marker
  (live-map AC-4.1 convention).
- AC-2.3 IF no transit itinerary exists THEN THE SYSTEM SHALL offer
  the walking route.

## US-3 Route mode on the map

- AC-3.1 WHILE a route is active THE SYSTEM SHALL highlight the
  itinerary geometry, its stops, and the vehicles serving its transit
  legs, and dim all other vehicles, stops, and lines.
- AC-3.2 WHEN the route is cleared THE SYSTEM SHALL restore the normal
  map state.

## US-4 Itinerary list view

- AC-4.1 THE SYSTEM SHALL render the active route as an ordered list
  of legs: walk/board/ride/alight with stop names, line badges, leg
  durations, departure/arrival times, and ⚠ on approximated values.
- AC-4.2 WHEN a leg is clicked in the list THE SYSTEM SHALL focus the
  map on that leg.
- AC-4.3 The list view SHALL be usable on mobile as a bottom sheet
  concurrently with the map.
