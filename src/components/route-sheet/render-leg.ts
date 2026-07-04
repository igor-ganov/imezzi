import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { MODE_HUES } from '../../lib/map/mode-hues.ts';
import { formatClock } from '../../lib/route/format-clock.ts';
import { formatDuration } from '../../lib/route/format-duration.ts';
import type { Leg } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';

const badgeText = (leg: Leg): string =>
  ({ true: 'walk', false: leg.line ?? '' })[`${leg.mode === 'walk'}`] ||
  leg.mode;

/** One itinerary leg row; click focuses the map on it (AC-4.2). */
export const renderLeg = (leg: Leg): TemplateResult => html`
  <li>
    <button class="leg-row" @click=${() => appState.focusLeg.set(leg)}>
      <span class="leg-times">
        ${formatClock(leg.startTime)}<br />${formatClock(leg.endTime)}
      </span>
      <span class="line-badge" style="--hue: ${MODE_HUES[leg.mode] ?? 208}"
        >${badgeText(leg)}</span
      >
      <span class="leg-desc">
        ${leg.from.name.toLowerCase()} → ${leg.to.name.toLowerCase()}
        <small>
          ${formatDuration(leg.durationSec)}
          ${branch((leg.intermediateStops.length ?? 0) > 0)(
            () => html` · ${leg.intermediateStops.length + 1} stops`,
            () => html``,
          )}
          ${branch(leg.headsign !== '')(
            () => html` · to ${leg.headsign?.toLowerCase()}`,
            () => html``,
          )}
        </small>
      </span>
      ${branch(leg.approximated)(
        () =>
          html`<span
            class="badge-approx"
            title="Times approximated from the timetable"
            aria-label="approximated"
            >!</span
          >`,
        () => html`<span class="badge-live" title="Live data"></span>`,
      )}
    </button>
  </li>
`;
