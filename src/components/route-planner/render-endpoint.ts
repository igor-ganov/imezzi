import { html, type TemplateResult } from 'lit';
import type { Place } from '../../lib/route/types.ts';

/** One endpoint row: label, current value, pick-on-map action. */
export const renderEndpoint = (
  label: string,
  place: Place | undefined,
  picking: boolean,
  onPick: () => void,
  extra: TemplateResult,
): TemplateResult => html`
  <div class="planner-row">
    <span class="planner-label">${label}</span>
    <span class="planner-value">${place?.name ?? '—'}</span>
    <button
      class="planner-btn"
      aria-pressed=${picking}
      title="Pick on the map"
      @click=${onPick}
    >
      ${{ true: 'click map…', false: 'map' }[`${picking}`]}
    </button>
    ${extra}
  </div>
`;
