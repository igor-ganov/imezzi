import type { UiLine } from '../../lib/lines/ui-line.ts';
import { appState } from '../../lib/store/app-state.ts';
import { normalizeLineLabel } from '../../lib/vehicles/normalize-line-label.ts';

/** Publish a new selection: keys for layers, labels for the fleet. */
export const applySelectionChange = (
  lines: readonly UiLine[],
  next: ReadonlySet<string>,
): void => {
  appState.selectedLines.set(next);
  appState.selectedLabels.set(
    new Set(
      lines
        .filter((line) => next.has(line.key))
        .map((line) => normalizeLineLabel(line.label)),
    ),
  );
};
