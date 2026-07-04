import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { CivicHit } from '../lib/civic/civic-hit.ts';
import { branch } from '../lib/branch.ts';
import { appState } from '../lib/store/app-state.ts';
import { renderCard } from './civic-card/render-card.ts';

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
      () => renderCard(this.hit, () => appState.activeCivic.set(undefined)),
    );
  }
}

customElements.define('civic-card', CivicCard);
