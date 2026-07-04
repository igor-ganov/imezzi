/** MOTIS/OTP leg mode → imezzi mode token (route-planner §2). */
export const motisMode = (mode: string): string => {
  switch (mode) {
    case 'WALK':
      return 'walk';
    case 'SUBWAY':
    case 'METRO':
      return 'metro';
    case 'RAIL':
    case 'HIGHSPEED_RAIL':
    case 'LONG_DISTANCE':
    case 'REGIONAL_RAIL':
    case 'REGIONAL_FAST_RAIL':
      return 'train';
    case 'FUNICULAR':
      return 'funicular';
    case 'FERRY':
      return 'boat';
    default:
      return 'bus';
  }
};
