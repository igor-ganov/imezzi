import { LitElement, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { CivicHit } from '../lib/civic/civic-hit.ts';
import type { Itinerary, Place } from '../lib/route/types.ts';
import { appState } from '../lib/store/app-state.ts';
import { bindPlannerHost } from './route-planner/bind-host.ts';
import { makePlannerController } from './route-planner/controller.ts';
import { makeDestinationSearch } from './route-planner/destination-search.ts';
import { renderPlannerRoot } from './route-planner/render-root.ts';

/** Route FAB + planner panel island (route-planner US-1). */
export class RoutePlanner extends LitElement {
  @state() declare open: boolean;
  @state() declare busy: boolean;
  @state() declare origin: Place | undefined;
  @state() declare destination: Place | undefined;
  @state() declare pickMode: 'origin' | 'destination' | undefined;
  @state() declare itineraries: readonly Itinerary[];
  @state() declare itinerary: Itinerary | undefined;
  @state() declare destinationHits: readonly CivicHit[];

  private readonly ctl = makePlannerController(this);

  constructor() {
    super();
    this.open = false;
    this.busy = false;
    this.itineraries = [];
    this.destinationHits = [];
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    bindPlannerHost(this);
  }

  private readonly onDestinationQuery = makeDestinationSearch(this);

  protected override render(): TemplateResult {
    return renderPlannerRoot(
      this,
      () => appState.plannerOpen.set(!this.open),
      {
        onLocate: this.ctl.locate,
        onClear: this.ctl.clear,
        onDestinationQuery: this.onDestinationQuery,
        onDestinationPick: (hit) => {
          appState.destination.set({
            name: hit.display,
            lat: hit.lat,
            lon: hit.lon,
          });
          this.destinationHits = [];
        },
      },
    );
  }
}

customElements.define('route-planner', RoutePlanner);
