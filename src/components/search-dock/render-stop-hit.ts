import { html, type TemplateResult } from 'lit';
import type { Stop } from '../../lib/amt/types.ts';
import { SEARCH_LOCATORS } from './search-dock.locators.ts';

/** An AMT stop row in the results list. */
export const renderStopHit = (
  stop: Stop,
  onPick: () => void,
): TemplateResult => html`
  <button
    class="search-hit"
    data-testid=${SEARCH_LOCATORS.stopHit}
    role="option"
    @click=${onPick}
  >
    <span class="civic-chip stop-chip">◉</span>
    <span class="search-hit-text">
      ${stop.name.toLowerCase()}
      <small>AMT stop ${stop.id}</small>
    </span>
  </button>
`;
