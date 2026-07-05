import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { loadStops } from '../lib/data/load-stops.ts';
import type { FleetTarget } from '../lib/fleet/fleet-target.ts';
import { vehicleBoard } from '../lib/fleet/vehicle-board.ts';
import { appState } from '../lib/store/app-state.ts';
import { renderVehicleSheet } from './vehicle-sheet/render-vehicle-sheet.ts';

const REFRESH_MS = 10000;

/** Bottom sheet: remaining stops of the tapped vehicle (US-1). */
export class VehicleSheet extends LitElement {
  @state() declare target: FleetTarget | undefined;
  @state() declare names: ReadonlyMap<string, string>;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    super();
    this.names = new Map();
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    void loadStops().then((stops) => {
      this.names = new Map(stops.map((stop) => [stop.id, stop.name]));
    });
    appState.activeVehicleId.subscribe((id) => {
      this.target = [id]
        .filter((value): value is string => value !== undefined)
        .map((value) => appState.fleetTargets.get().get(value))[0];
      clearInterval(this.timer);
      this.timer = setInterval(() => this.requestUpdate(), REFRESH_MS);
    });
    appState.fleetTargets.subscribe((targets) => {
      this.target = [appState.activeVehicleId.get()]
        .filter((value): value is string => value !== undefined)
        .map((value) => targets.get(value) ?? this.target)[0];
    });
  }

  protected override render(): TemplateResult {
    return (
      [this.target]
        .filter((value): value is FleetTarget => value !== undefined)
        .map((target) =>
          renderVehicleSheet(
            target.label,
            target.template?.lastStopName ?? '',
            vehicleBoard(target, this.names, Date.now()),
            () => {
              appState.activeVehicleId.set(undefined);
              appState.selectedVehicleId.set(undefined);
            },
          ),
        )[0] ?? html``
    );
  }
}

customElements.define('vehicle-sheet', VehicleSheet);
