import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { DockActions } from './dock-actions.ts';

/** Dock header: search input + clear-selection control. */
export const renderDockHead = (
  query: string,
  selectedCount: number,
  actions: DockActions,
): TemplateResult => html`
  <div class="dock-head">
    <input
      class="dock-search"
      data-testid="filter-search"
      type="search"
      placeholder="Line number or destination…"
      aria-label="Search lines"
      .value=${query}
      @input=${(event: Event) =>
        actions.onQuery(
          (event.target instanceof HTMLInputElement && event.target.value) ||
            '',
        )}
    />
    ${branch(selectedCount > 0)(
      () =>
        html`<button
          class="dock-clear"
          data-testid="filter-clear"
          @click=${actions.onClear}
        >
          Clear ${selectedCount}
        </button>`,
      () => html``,
    )}
  </div>
`;
