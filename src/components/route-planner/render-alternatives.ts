import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { formatDuration } from '../../lib/route/format-duration.ts';
import type { Itinerary } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';
import { PLANNER_LOCATORS } from './route-planner.locators.ts';

/** Alternative itineraries as selectable chips (route-planner §2). */
export const renderAlternatives = (
  itineraries: readonly Itinerary[],
  active: Itinerary | undefined,
): TemplateResult => html`
  <div class="planner-alts" role="tablist" aria-label="Route alternatives">
    ${itineraries.map(
      (itinerary, index) => html`
        <button
          class=${classMap({
            'alt-chip': true,
            'is-active': itinerary === active,
          })}
          data-testid=${PLANNER_LOCATORS.altChip}
          role="tab"
          aria-selected=${itinerary === active}
          @click=${() => appState.itinerary.set(itinerary)}
        >
          <strong>${formatDuration(itinerary.durationSec)}</strong>
          <small
            >${index + 1} · ${itinerary.transfers}
            ${{ true: 'transfer', false: 'transfers' }[
              `${itinerary.transfers === 1}`
            ]}</small
          >
        </button>
      `,
    )}
  </div>
`;
