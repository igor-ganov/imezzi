/**
 * GTFS route_type → imezzi mode token. AMT leaves route_type blank
 * for the public elevators (ascensori) — mapped to `lift`.
 */
export const modeOf = (routeType: string): string => {
  switch (routeType) {
    case '1':
      return 'metro';
    case '2':
      return 'train';
    case '3':
      return 'bus';
    case '4':
      return 'boat';
    case '7':
      return 'funicular';
    default:
      return 'lift';
  }
};
