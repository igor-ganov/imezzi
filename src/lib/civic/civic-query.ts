/** Parsed Genoa address query (civic-addresses US-2). */
export interface CivicQuery {
  readonly street: string;
  readonly number: number | undefined;
  readonly letter: string;
  /** true when the red suffix (`20r`, `20 rosso`) was given. */
  readonly red: boolean;
}
