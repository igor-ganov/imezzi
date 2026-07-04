import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import { SEARCH_LOCATORS } from './search-dock.locators.ts';

const SOURCE_NOTES: Readonly<Record<string, string>> = {
  comune: 'Comune di Genova',
  osm: 'OpenStreetMap',
};

/** A civic address row in the results list. */
export const renderCivicHit = (
  civic: CivicHit,
  onPick: () => void,
): TemplateResult => html`
  <button
    class="search-hit"
    data-testid=${SEARCH_LOCATORS.civicHit}
    role="option"
    @click=${onPick}
  >
    <span class=${classMap({ 'civic-chip': true, 'civic-chip-red': civic.red })}
      >${{ true: 'r', false: 'n' }[`${civic.red}`]}</span
    >
    <span class="search-hit-text">
      ${civic.display}
      <small>${civic.municipio} · ${SOURCE_NOTES[civic.source]}</small>
    </span>
  </button>
`;
