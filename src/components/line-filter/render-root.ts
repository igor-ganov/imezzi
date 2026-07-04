import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import { FILTER_LOCATORS } from './line-filter.locators.ts';
import { renderDock, type DockActions } from './render-dock.ts';

export interface FilterHost {
  readonly open: boolean;
  readonly query: string;
  readonly lines: readonly UiLine[];
  readonly selected: ReadonlySet<string>;
}

/** FAB toggle + dock (open state) for the line filter island. */
export const renderRoot = (
  host: FilterHost,
  onFab: () => void,
  actions: DockActions,
): TemplateResult => html`
  <button
    class="chrome-btn fab-filter"
    data-testid=${FILTER_LOCATORS.fab}
    aria-label="Filter lines"
    aria-expanded=${host.open}
    @click=${onFab}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
    ${branch(host.selected.size > 0)(
      () =>
        html`<span class="fab-count" data-testid=${FILTER_LOCATORS.count}
          >${host.selected.size}</span
        >`,
      () => html``,
    )}
  </button>
  ${branch(host.open)(
    () => renderDock(host.lines, host.selected, host.query, actions),
    () => html``,
  )}
`;
