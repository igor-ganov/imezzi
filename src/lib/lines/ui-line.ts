/** A selectable line in the filter UI (live-map US-2). */
export interface UiLine {
  /** Selection key: AMT app id for buses, GTFS id for other modes. */
  readonly key: string;
  /** Short badge label, e.g. `9`, `MM`, `FGC`. */
  readonly label: string;
  readonly description: string;
  readonly mode: string;
}
