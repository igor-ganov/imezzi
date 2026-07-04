import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { appState } from '../../lib/store/app-state.ts';
import type { PanelActions, PanelState } from './panel-contract.ts';
import { renderAlternatives } from './render-alternatives.ts';
import { renderDestinationSearch } from './render-destination-search.ts';
import { renderEndpoint } from './render-endpoint.ts';

export type { PanelActions, PanelState } from './panel-contract.ts';

/** Route planner panel body (route-planner US-1, §2). */
export const renderPanel = (
  state: PanelState,
  actions: PanelActions,
): TemplateResult => html`
  <section class="planner" aria-label="Route planner">
    ${renderEndpoint(
      'From',
      state.origin,
      state.pickMode === 'origin',
      () => appState.pickMode.set('origin'),
      html`<button class="planner-btn" @click=${actions.onLocate}>
        my location
      </button>`,
    )}
    ${renderEndpoint(
      'To',
      state.destination,
      state.pickMode === 'destination',
      () => appState.pickMode.set('destination'),
      html``,
    )}
    ${renderDestinationSearch(
      state.destinationHits,
      actions.onDestinationQuery,
      actions.onDestinationPick,
    )}
    ${branch(state.busy)(
      () => html`<p class="sheet-note">Planning…</p>`,
      () => html``,
    )}
    ${renderAlternatives(state.itineraries, state.itinerary)}
    ${branch(state.itinerary !== undefined || state.origin !== undefined)(
      () =>
        html`<button class="dock-clear planner-clear" @click=${actions.onClear}>
          Clear route
        </button>`,
      () => html``,
    )}
  </section>
`;
