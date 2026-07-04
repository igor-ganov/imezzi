/** Human ETA for board rows: now / N min / H.h h (live-map US-3). */
export const formatEta = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  switch (true) {
    case seconds < 45:
      return 'now';
    case minutes < 90:
      return `${minutes} min`;
    default:
      return `${Math.round((minutes / 60) * 10) / 10} h`;
  }
};
