import { html, type TemplateResult } from 'lit';
import { formatClock } from '../../lib/route/format-clock.ts';
import { formatDuration } from '../../lib/route/format-duration.ts';
import type { Itinerary } from '../../lib/route/types.ts';
import { appState } from '../../lib/store/app-state.ts';

/** Itinerary sheet header: times, duration, transfers, close. */
export const renderRouteHeader = (
  itinerary: Itinerary | undefined,
): TemplateResult => html`
  <header class="sheet-header">
    <h2 class="sheet-title">
      ${formatClock(itinerary?.startTime ?? '')} →
      ${formatClock(itinerary?.endTime ?? '')}
      <small class="sheet-subtitle">
        ${formatDuration(itinerary?.durationSec ?? 0)} ·
        ${itinerary?.transfers} transfers
      </small>
    </h2>
    <button
      class="chrome-btn sheet-close"
      data-testid="route-sheet-close"
      aria-label="Close route"
      @click=${() => {
        appState.itinerary.set(undefined);
        appState.itineraries.set([]);
        appState.selectedVehicleId.set(undefined);
      }}
    >
      ✕
    </button>
  </header>
`;
