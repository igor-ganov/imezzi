import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { FleetTarget } from '../lib/fleet/fleet-target.ts';
import { closeVehicle } from './vehicle-sheet/close-vehicle.ts';
import { observeVehicleSheet } from './vehicle-sheet/observe.ts';
import { renderActiveVehicle } from './vehicle-sheet/render-active.ts';

/** Bottom sheet: remaining stops of the tapped vehicle (US-1). */
export class VehicleSheet extends LitElement {
  @state() declare target: FleetTarget | undefined;
  @state() declare names: ReadonlyMap<string, string>;
  @state() declare collapsed: boolean;

  constructor() {
    super();
    this.names = new Map();
    this.collapsed = false;
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    observeVehicleSheet(this);
  }

  protected override render(): TemplateResult {
    return (
      [this.target]
        .filter((value): value is FleetTarget => value !== undefined)
        .map((target) =>
          renderActiveVehicle(
            target,
            this.names,
            this.collapsed,
            (value) => {
              this.collapsed = value;
            },
            closeVehicle,
          ),
        )[0] ?? html``
    );
  }
}

customElements.define('vehicle-sheet', VehicleSheet);
