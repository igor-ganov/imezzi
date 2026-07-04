import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { SearchHit } from '../../lib/search/search-hit.ts';
import { renderCivicHit } from './render-civic-hit.ts';
import { renderStopHit } from './render-stop-hit.ts';
import { SEARCH_LOCATORS } from './search-dock.locators.ts';

const renderHit = (
  hit: SearchHit,
  onPick: (hit: SearchHit) => void,
): TemplateResult => {
  switch (hit.kind) {
    case 'civic':
      return renderCivicHit(hit.civic, () => onPick(hit));
    case 'stop':
      return renderStopHit(hit.stop, () => onPick(hit));
  }
};

/** Search results dropdown: stops and red/black civics (US-2). */
export const renderResults = (
  hits: readonly SearchHit[],
  onPick: (hit: SearchHit) => void,
): TemplateResult =>
  branch(hits.length === 0)(
    () => html``,
    () => html`
      <ul
        class="search-results"
        data-testid=${SEARCH_LOCATORS.results}
        role="listbox"
      >
        ${hits.map((hit) => html`<li>${renderHit(hit, onPick)}</li>`)}
      </ul>
    `,
  );
