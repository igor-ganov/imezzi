export interface TickEntry {
  /** Epoch ms of the tick. */
  readonly t: number;
  readonly stops: number;
  readonly sightings: number;
  readonly vehicles: number;
  readonly ms: number;
  readonly sockets: number;
  /** Failed/empty upstream fetches in the portion. */
  readonly errors: number;
  /** Clock-wrapped (already-passed) rows the upstream emitted. */
  readonly wrapped: number;
  /** Hot stops that led the slice this tick. */
  readonly hot: number;
  readonly anomaly?: string;
}

const CAP = 300;
const SLOW_MS = 8000;
const DROP_RATIO = 0.3;
const ERROR_RATIO = 0.5;

const anomalyOf = (
  entry: Omit<TickEntry, 'anomaly'>,
  previous: TickEntry | undefined,
): string | undefined => {
  const before = previous?.vehicles ?? 0;
  const checks: readonly (readonly [string, boolean])[] = [
    // Stops were polled yet NOTHING parsed — upstream down or empty
    // bodies (AMT does that without a User-Agent, or during outages).
    ['empty', entry.stops > 0 && entry.sightings === 0],
    ['errors', entry.stops > 0 && entry.errors > entry.stops * ERROR_RATIO],
    ['slow', entry.ms > SLOW_MS],
    // The fleet shrank to under 30% of the previous tick — parsing
    // regression or upstream flapping, never a real fleet change.
    ['vehicle-drop', before >= 10 && entry.vehicles < before * DROP_RATIO],
  ];
  return checks.find(([, hit]) => hit)?.[0];
};

/** Append a tick to the ring log, stamping detected anomalies. */
export const pushTick = (
  log: readonly TickEntry[],
  entry: Omit<TickEntry, 'anomaly'>,
): readonly TickEntry[] => {
  const stamp = [anomalyOf(entry, log[log.length - 1])]
    .filter((value): value is string => value !== undefined)
    .map((value) => ({ anomaly: value }));
  return [...log, { ...entry, ...stamp[0] }].slice(-CAP);
};
