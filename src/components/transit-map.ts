import { LitElement, html, type TemplateResult } from 'lit';
import 'maplibre-gl/dist/maplibre-gl.css';
import { makeMapController } from './transit-map/controller.ts';

/**
 * Full-viewport live transit map island (site design §4). MapLibre
 * mounts on the inner div — it stamps `.maplibregl-map { position:
 * relative }` on its container, which must not fight the host's
 * fixed positioning.
 */
export class TransitMap extends LitElement {
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override firstUpdated(): void {
    const host = this.querySelector('.map-host');
    [host]
      .filter((el): el is HTMLElement => el instanceof HTMLElement)
      .forEach((el) => makeMapController(el).start());
  }

  protected override render(): TemplateResult {
    return html`<div class="map-host"></div>`;
  }
}

customElements.define('transit-map', TransitMap);
