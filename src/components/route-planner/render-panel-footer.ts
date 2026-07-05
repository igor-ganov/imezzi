import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { PanelActions, PanelState } from './panel-contract.ts';
import { PLANNER_LOCATORS } from './route-planner.locators.ts';

/**
 * Panel footer: busy note and the clear control. Alternatives moved
 * to the sheet cards — the panel is purely an input surface.
 */
export const renderPanelFooter = (
  state: PanelState,
  actions: PanelActions,
): TemplateResult => html`
  ${branch(state.busy)(
    () =>
      html`<p class="sheet-note" data-testid=${PLANNER_LOCATORS.busy}>
        Planning…
      </p>`,
    () => html``,
  )}
  ${branch(state.itinerary !== undefined || state.origin !== undefined)(
    () =>
      html`<button
        class="dock-clear planner-clear"
        data-testid=${PLANNER_LOCATORS.clear}
        @click=${actions.onClear}
      >
        Clear route
      </button>`,
    () => html``,
  )}
`;
