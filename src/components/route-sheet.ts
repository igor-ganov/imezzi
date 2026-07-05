import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { branch } from '../lib/branch.ts';
import type { Itinerary } from '../lib/route/types.ts';
import { appState } from '../lib/store/app-state.ts';
import { renderExpanded } from './route-sheet/render-expanded.ts';
import { renderMiniBar } from './route-sheet/render-mini-bar.ts';

/** Itinerary list view in the bottom sheet (route-planner US-4). */
export class RouteSheet extends LitElement {
  @state() declare itinerary: Itinerary | undefined;
  @state() declare itineraries: readonly Itinerary[];
  @state() declare collapsed: boolean;

  constructor() {
    super();
    this.itineraries = [];
    this.collapsed = false;
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    appState.itinerary.subscribe((itinerary) => {
      this.itinerary = itinerary;
    });
    appState.itineraries.subscribe((itineraries) => {
      this.itineraries = itineraries;
    });
  }

  protected override render(): TemplateResult {
    return branch(this.itinerary === undefined)(
      () => html``,
      () =>
        branch(this.collapsed)(
          () =>
            renderMiniBar(this.itinerary, () => {
              this.collapsed = false;
            }),
          () =>
            renderExpanded(this.itinerary, this.itineraries, () => {
              this.collapsed = true;
            }),
        ),
    );
  }
}

customElements.define('route-sheet', RouteSheet);
