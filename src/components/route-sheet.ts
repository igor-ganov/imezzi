import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { branch } from '../lib/branch.ts';
import type { Itinerary } from '../lib/route/types.ts';
import { appState } from '../lib/store/app-state.ts';
import { renderLeg } from './route-sheet/render-leg.ts';
import { renderRouteHeader } from './route-sheet/render-route-header.ts';

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
          ${renderRouteHeader(this.itinerary)}
          <ul class="board">
            ${this.itinerary?.legs.map((leg, index) => renderLeg(leg, index))}
          </ul>
        </section>
      `,
    );
  }
}

customElements.define('route-sheet', RouteSheet);
