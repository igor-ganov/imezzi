import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import type { CivicHit } from '../lib/civic/civic-hit.ts';
import { branch } from '../lib/branch.ts';
import { appState } from '../lib/store/app-state.ts';

const MEANING: Readonly<Record<string, string>> = {
  true: 'Red number — commercial premises, shops, secondary accesses.',
  false: 'Black number — main residential entrance.',
};

/** Card explaining a clicked civic number (civic-addresses AC-1.2). */
export class CivicCard extends LitElement {
  @state() declare hit: CivicHit | undefined;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    appState.activeCivic.subscribe((hit) => {
      this.hit = hit;
    });
  }

  protected override render(): TemplateResult {
    return branch(this.hit === undefined)(
      () => html``,
      () => html`
        <aside class="sheet civic-card" aria-label="Civic number details">
          <header class="sheet-header">
            <h2 class="sheet-title">
              <span
                class=${classMap({
                  'civic-chip': true,
                  'civic-chip-red': this.hit?.red ?? false,
                })}
                >${{ true: 'r', false: 'n' }[`${this.hit?.red ?? false}`]}</span
              >
              ${this.hit?.display}
            </h2>
            <button
              class="chrome-btn sheet-close"
              aria-label="Close"
              @click=${() => appState.activeCivic.set(undefined)}
            >
              ✕
            </button>
          </header>
          <p class="sheet-note">${MEANING[`${this.hit?.red ?? false}`]}</p>
          <p class="sheet-note">
            Municipio ${this.hit?.municipio} · data © Comune di Genova (CC BY
            4.0)
          </p>
        </aside>
      `,
    );
  }
}

customElements.define('civic-card', CivicCard);
