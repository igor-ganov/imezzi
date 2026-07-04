import { html, type TemplateResult } from 'lit';
import { appState } from '../../lib/store/app-state.ts';
import type { PanelActions, PanelState } from './panel-contract.ts';
import { renderDestinationSearch } from './render-destination-search.ts';
import { renderEndpoint } from './render-endpoint.ts';
import { renderPanelFooter } from './render-panel-footer.ts';
import { PLANNER_LOCATORS } from './route-planner.locators.ts';

export type { PanelActions, PanelState } from './panel-contract.ts';

/** Route planner panel body (route-planner US-1, §2). */
export const renderPanel = (
  state: PanelState,
  actions: PanelActions,
): TemplateResult => html`
  <section
    class="planner"
    data-testid=${PLANNER_LOCATORS.panel}
    aria-label="Route planner"
  >
    ${renderEndpoint(
      'From',
      state.origin,
      state.pickMode === 'origin',
      () => appState.pickMode.set('origin'),
      html`<button
        class="planner-btn"
        data-testid=${PLANNER_LOCATORS.locate}
        @click=${actions.onLocate}
      >
        my location
      </button>`,
      PLANNER_LOCATORS.pickOrigin,
    )}
    ${renderEndpoint(
      'To',
      state.destination,
      state.pickMode === 'destination',
      () => appState.pickMode.set('destination'),
      html``,
      PLANNER_LOCATORS.pickDestination,
    )}
    ${renderDestinationSearch(
      state.destinationHits,
      actions.onDestinationQuery,
      actions.onDestinationPick,
    )}
    ${renderPanelFooter(state, actions)}
  </section>
`;
