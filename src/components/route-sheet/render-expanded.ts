import { html, type TemplateResult } from 'lit';
import type { Itinerary } from '../../lib/route/types.ts';
import { renderAlternativeCards } from './render-alternative-cards.ts';
import { renderLeg } from './render-leg.ts';
import { renderRouteHeader } from './render-route-header.ts';

/** Full itinerary description: header, alternatives, leg list. */
export const renderExpanded = (
  itinerary: Itinerary | undefined,
  itineraries: readonly Itinerary[],
  onCollapse: () => void,
): TemplateResult => html`
  <section
    class="sheet route-sheet"
    data-testid="route-sheet"
    aria-label="Itinerary"
  >
    ${renderRouteHeader(itinerary, onCollapse)}
    ${renderAlternativeCards(itineraries, itinerary)}
    <ul class="board">
      ${itinerary?.legs.map((leg, index) => renderLeg(leg, index))}
    </ul>
  </section>
`;
