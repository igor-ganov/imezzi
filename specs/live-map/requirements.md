# live-map — requirements

## Overview

Real-time visualisation of Genoa public transport on the map: AMT
buses, metro, funiculars/rack railway, commuter rail. Vehicles move on
the map; lines can be filtered; stops show upcoming arrivals. Where
real-time data is missing, arrivals and vehicle positions are
approximated from the timetable and flagged as such.

## US-1 Live vehicles

As a user, I want to see transport moving on the map, so that I know
where my bus actually is.

- AC-1.1 WHEN real-time positions are available THE SYSTEM SHALL show
  each vehicle as a mode-coloured marker with its line number, updated
  at the source cadence and animated between updates.
- AC-1.2 WHEN a vehicle has no real-time feed (or a gap longer than 90
  seconds) THE SYSTEM SHALL show a timetable-approximated position and
  mark the marker with a warning (⚠) badge.
- AC-1.3 All modes SHALL be distinguishable by colour and glyph:
  bus, metro, funicular/rack, train, boat (if data exists), walking
  (route mode only).

## US-2 Line filtering

As a user, I want to filter by line, so that I follow only my
transport.

- AC-2.1 WHEN one or more lines are selected THE SYSTEM SHALL show
  only their vehicles, draw their route geometry highlighted, and
  highlight only their stops; everything else SHALL be hidden or
  dimmed.
- AC-2.2 WHEN the filter is cleared THE SYSTEM SHALL restore the full
  network view.
- AC-2.3 The filter control SHALL support search by line number/name
  and group lines by mode.

## US-3 Stops and arrivals

As a user at a stop, I want to tap the stop and see what is coming and
in how many minutes.

- AC-3.1 WHEN a stop is clicked THE SYSTEM SHALL show the list of
  lines serving it and the next arrivals per line with minutes-to-
  arrival.
- AC-3.2 WHEN an arrival time is real-time THE SYSTEM SHALL mark it
  live; WHEN it is derived from the timetable (approximated) THE
  SYSTEM SHALL mark it with the ⚠ warning icon — in both the popup
  list and any badges.
- AC-3.3 Timetable approximation SHALL account for current traffic
  conditions when a traffic source is available, and state its
  assumptions in the UI (tooltip/legend).
- AC-3.4 WHILE a stop popup is open THE SYSTEM SHALL refresh its
  arrivals at the same cadence as vehicle positions.

## US-4 Data honesty

- AC-4.1 THE SYSTEM SHALL visibly distinguish live data from
  approximated data everywhere both can appear (markers, popups, route
  legs) using one consistent ⚠ convention.
- AC-4.2 WHEN the data source is unreachable THE SYSTEM SHALL show a
  staleness banner with the age of the last successful update.
