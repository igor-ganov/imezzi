/** GTFS `HH:MM:SS` (may exceed 24 h) → seconds since service day. */
export const toSeconds = (time: string): number => {
  const [h, m, s] = time.split(':').map((part) => Number(part));
  return (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0);
};
