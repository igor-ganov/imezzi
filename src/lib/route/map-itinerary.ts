import { decodePolyline } from './decode-polyline.ts';
import { motisMode } from './motis-mode.ts';
import type { MotisItinerary, MotisLeg, MotisPlace } from './motis-types.ts';
import type { Itinerary, Leg, Place } from './types.ts';

const toPlace = (place: MotisPlace): Place => ({
  name: place.name,
  lat: place.lat,
  lon: place.lon,
  stopId: place.stopId?.split('_').pop() ?? '',
});

const toLeg = (leg: MotisLeg): Leg => {
  const mode = motisMode(leg.mode);
  return {
    mode,
    line: leg.routeShortName ?? '',
    headsign: leg.headsign ?? '',
    from: toPlace(leg.from),
    to: toPlace(leg.to),
    startTime: leg.startTime,
    endTime: leg.endTime,
    durationSec: leg.duration,
    geometry: decodePolyline(
      leg.legGeometry.points,
      leg.legGeometry.precision,
    ),
    approximated: mode !== 'walk' && !leg.realTime,
    intermediateStops: (leg.intermediateStops ?? []).map(toPlace),
  };
};

/** MOTIS itinerary → app model; timetable legs carry ⚠ (AC-2.2). */
export const mapItinerary = (itinerary: MotisItinerary): Itinerary => ({
  legs: itinerary.legs.map(toLeg),
  startTime: itinerary.startTime,
  endTime: itinerary.endTime,
  durationSec: itinerary.duration,
  transfers: itinerary.transfers,
});
