/** Callbacks the dock hands back to the island shell. */
export interface DockActions {
  readonly onQuery: (query: string) => void;
  readonly onToggle: (key: string) => void;
  readonly onClear: () => void;
}
