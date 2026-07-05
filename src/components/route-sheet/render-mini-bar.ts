import { html, type TemplateResult } from 'lit';
import { MODE_HUES } from '../../lib/map/mode-hues.ts';
import { formatClock } from '../../lib/route/format-clock.ts';
import { formatDuration } from '../../lib/route/format-duration.ts';
import { itineraryBadges } from '../../lib/route/itinerary-badges.ts';
import type { Itinerary } from '../../lib/route/types.ts';

/**
 * Collapsed itinerary: one slim bar with the essentials — tapping
 * anywhere expands back to the full description (route US-4).
 */
export const renderMiniBar = (
  itinerary: Itinerary | undefined,
  onExpand: () => void,
): TemplateResult => html`
  <button
    class="route-mini"
    data-testid="route-mini"
    aria-label="Expand route description"
    aria-expanded="false"
    @click=${onExpand}
  >
    <strong>
      ${formatClock(itinerary?.startTime ?? '')} →
      ${formatClock(itinerary?.endTime ?? '')}
    </strong>
    <span class="alt-card-badges">
      ${itineraryBadges(
        itinerary ?? {
          legs: [],
          startTime: '',
          endTime: '',
          durationSec: 0,
          transfers: 0,
        },
      ).map(
        (badge) => html`
          <span
            class="line-badge"
            style="--mode-hue: ${MODE_HUES[badge.mode] ?? 210}"
            >${badge.line}</span
          >
        `,
      )}
    </span>
    <small>
      ${formatDuration(itinerary?.durationSec ?? 0)} ·
      ${itinerary?.transfers}⇄
    </small>
    <span class="route-mini-chevron" aria-hidden="true">⌃</span>
  </button>
`;
