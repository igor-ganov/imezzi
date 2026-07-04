import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import { branch } from '../../lib/branch.ts';

const SOURCE_NOTES: Readonly<Record<string, string>> = {
  comune: 'Comune di Genova',
  osm: 'OpenStreetMap',
};

/** Search results dropdown with red/black civic chips (AC-2.1). */
export const renderResults = (
  hits: readonly CivicHit[],
  onPick: (hit: CivicHit) => void,
): TemplateResult =>
  branch(hits.length === 0)(
    () => html``,
    () => html`
      <ul class="search-results" role="listbox">
        ${hits.map(
          (hit) => html`
            <li>
              <button class="search-hit" role="option" @click=${() => onPick(hit)}>
                <span
                  class=${classMap({
                    'civic-chip': true,
                    'civic-chip-red': hit.red,
                  })}
                  >${{ true: 'r', false: 'n' }[`${hit.red}`]}</span
                >
                <span class="search-hit-text">
                  ${hit.display}
                  <small>${hit.municipio} · ${SOURCE_NOTES[hit.source]}</small>
                </span>
              </button>
            </li>
          `,
        )}
      </ul>
    `,
  );
