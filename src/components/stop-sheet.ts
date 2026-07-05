import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { BoardRow } from '../lib/arrivals/board-row.ts';
import { branch } from '../lib/branch.ts';
import { loadStops } from '../lib/data/load-stops.ts';
import { routeTo } from '../lib/route/route-to.ts';
import { appState } from '../lib/store/app-state.ts';
import { makeStopSheetController } from './stop-sheet/controller.ts';
import { renderSheet } from './stop-sheet/render-sheet.ts';

/** Bottom sheet: departures board of the active stop (live-map US-3). */
export class StopSheet extends LitElement {
  @state() declare stopId: string | undefined;
  @state() declare stopName: string;
  @state() declare rows: readonly BoardRow[];
  @state() declare stale: boolean;

  private readonly ctl = makeStopSheetController(this);

  constructor() {
    super();
    this.stopName = '';
    this.rows = [];
    this.stale = false;
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    appState.activeStopId.subscribe((id) => this.ctl.onStopChange(id));
  }

  private readonly onRoute = async (): Promise<void> => {
    const stop = (await loadStops()).find((entry) => entry.id === this.stopId);
    [stop]
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
      .forEach((entry) =>
        routeTo({ name: entry.name, lat: entry.lat, lon: entry.lon }),
      );
  };

  protected override render(): TemplateResult {
    return branch(this.stopId !== undefined)(
      () =>
        renderSheet(
          this,
          () => appState.activeStopId.set(undefined),
          () => void this.onRoute(),
        ),
      () => html``,
    );
  }
}

customElements.define('stop-sheet', StopSheet);
