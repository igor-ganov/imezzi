import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { MODE_HUES } from '../../lib/map/mode-hues.ts';
import { formatClock } from '../../lib/route/format-clock.ts';
import { formatDuration } from '../../lib/route/format-duration.ts';
import { itineraryBadges } from '../../lib/route/itinerary-badges.ts';
import type { Itinerary } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';

/**
 * All computed alternatives as informative cards: departure→arrival,
 * duration, transfers and the ordered line badges — clicking one
 * makes it the active itinerary (route US-4).
 */
export const renderAlternativeCards = (
  itineraries: readonly Itinerary[],
  active: Itinerary | undefined,
): TemplateResult => html`
  <div
    class="sheet-alts"
    role="tablist"
    aria-label="Route alternatives"
  >
    ${itineraries.map(
      (itinerary) => html`
        <button
          class=${classMap({
            'alt-card': true,
            'is-active': itinerary === active,
          })}
          data-testid="route-alt-card"
          role="tab"
          aria-selected=${itinerary === active}
          @click=${() => appState.itinerary.set(itinerary)}
        >
          <span class="alt-card-times">
            <strong>
              ${formatClock(itinerary.startTime)} →
              ${formatClock(itinerary.endTime)}
            </strong>
            <small>
              ${formatDuration(itinerary.durationSec)} ·
              ${itinerary.transfers}⇄
            </small>
          </span>
          <span class="alt-card-badges">
            ${itineraryBadges(itinerary).map(
              (badge) => html`
                <span
                  class="line-badge"
                  style="--mode-hue: ${MODE_HUES[badge.mode] ?? 210}"
                  >${badge.line}</span
                >
              `,
            )}
          </span>
        </button>
      `,
    )}
  </div>
`;
