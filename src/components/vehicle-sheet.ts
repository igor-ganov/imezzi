import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { Stop } from '../lib/amt/types.ts';
import type { FleetTarget } from '../lib/fleet/fleet-target.ts';
import { maybeCenter } from './vehicle-sheet/center-on-bus.ts';
import { closeVehicle } from './vehicle-sheet/close-vehicle.ts';
import { observeVehicleSheet } from './vehicle-sheet/observe.ts';
import { renderActiveVehicle } from './vehicle-sheet/render-active.ts';

/** Bottom sheet: the tapped vehicle's stop board or line diagram. */
export class VehicleSheet extends LitElement {
  @state() declare target: FleetTarget | undefined;
  @state() declare stops: ReadonlyMap<string, Stop>;
  @state() declare me: { readonly lon: number; readonly lat: number } | undefined;
  @state() declare collapsed: boolean;
  private centeredFor: string | undefined;

  constructor() {
    super();
    this.stops = new Map();
    this.collapsed = false;
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    observeVehicleSheet(this);
  }

  protected override updated(): void {
    this.centeredFor = maybeCenter(
      this,
      this.collapsed,
      this.target?.id,
      this.centeredFor,
    );
  }

  protected override render(): TemplateResult {
    return (
      [this.target]
        .filter((value): value is FleetTarget => value !== undefined)
        .map((target) =>
          renderActiveVehicle({
            target,
            stops: this.stops,
            me: this.me,
            collapsed: this.collapsed,
            setCollapsed: (value) => {
              this.collapsed = value;
            },
            onClose: closeVehicle,
          }),
        )[0] ?? html``
    );
  }
}

customElements.define('vehicle-sheet', VehicleSheet);
