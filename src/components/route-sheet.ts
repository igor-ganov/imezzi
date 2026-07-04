import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { branch } from '../lib/branch.ts';
import { formatClock } from '../lib/route/format-clock.ts';
import { formatDuration } from '../lib/route/format-duration.ts';
import type { Itinerary } from '../lib/route/types.ts';
import { appState } from '../lib/store/app-state.ts';
import { renderLeg } from './route-sheet/render-leg.ts';

/** Itinerary list view in the bottom sheet (route-planner US-4). */
export class RouteSheet extends LitElement {
  @state() declare itinerary: Itinerary | undefined;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    appState.itinerary.subscribe((itinerary) => {
      this.itinerary = itinerary;
    });
  }

  protected override render(): TemplateResult {
    return branch(this.itinerary === undefined)(
      () => html``,
      () => html`
        <section
          class="sheet route-sheet"
          data-testid="route-sheet"
          aria-label="Itinerary"
        >
          <header class="sheet-header">
            <h2 class="sheet-title">
              ${formatClock(this.itinerary?.startTime ?? '')} →
              ${formatClock(this.itinerary?.endTime ?? '')}
              <small class="sheet-subtitle">
                ${formatDuration(this.itinerary?.durationSec ?? 0)} ·
                ${this.itinerary?.transfers} transfers
              </small>
            </h2>
            <button
              class="chrome-btn sheet-close"
              data-testid="route-sheet-close"
              aria-label="Close route"
              @click=${() => {
                appState.itinerary.set(undefined);
                appState.itineraries.set([]);
              }}
            >
              ✕
            </button>
          </header>
          <ul class="board">
            ${this.itinerary?.legs.map(renderLeg)}
          </ul>
        </section>
      `,
    );
  }
}

customElements.define('route-sheet', RouteSheet);
