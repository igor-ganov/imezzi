/** Everything needed to place one bus line's vehicles on the map. */
export interface BusDirection {
  readonly dir: number;
  readonly stopIds: readonly string[];
  readonly lastStopName: string;
  readonly path: readonly (readonly [number, number])[];
}

export interface BusLineContext {
  readonly key: string;
  readonly label: string;
  readonly directions: readonly BusDirection[];
  /** stopId → [lon, lat]. */
  readonly stopCoords: Readonly<
    Record<string, readonly [number, number] | undefined>
  >;
  /** Stops with SIMON coverage — the ones worth polling. */
  readonly monitoredStopIds: readonly string[];
}
