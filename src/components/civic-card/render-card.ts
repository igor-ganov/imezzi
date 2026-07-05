import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import { routeTo } from '../../lib/route/route-to.ts';
import { renderRouteButton } from '../shared/render-route-button.ts';

const MEANING: Readonly<Record<string, string>> = {
  true: 'Red number — commercial premises, shops, secondary accesses.',
  false: 'Black number — main residential entrance.',
};

/** Card body for a clicked civic number (civic-addresses AC-1.2). */
export const renderCard = (
  hit: CivicHit | undefined,
  onClose: () => void,
): TemplateResult => html`
  <aside
    class="sheet civic-card"
    data-testid="civic-card"
    aria-label="Civic number details"
  >
    <header class="sheet-header">
      <h2 class="sheet-title">
        <span
          class=${classMap({
            'civic-chip': true,
            'civic-chip-red': hit?.red ?? false,
          })}
          >${{ true: 'r', false: 'n' }[`${hit?.red ?? false}`]}</span
        >
        ${hit?.display}
      </h2>
      ${renderRouteButton('civic-card-route', 'Route to this address', () =>
        [hit]
          .filter((value): value is CivicHit => value !== undefined)
          .forEach((value) =>
            routeTo({ name: value.display, lat: value.lat, lon: value.lon }),
          ),
      )}
      <button
        class="chrome-btn sheet-close"
        data-testid="civic-card-close"
        aria-label="Close"
        @click=${onClose}
      >
        ✕
      </button>
    </header>
    <p class="sheet-note">${MEANING[`${hit?.red ?? false}`]}</p>
    <p class="sheet-note">
      Municipio ${hit?.municipio} · data © Comune di Genova (CC BY 4.0)
    </p>
  </aside>
`;
