import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { VehicleStrip } from '../../lib/fleet/vehicle-strip.ts';

/** Collapsed vehicle sheet: a metro-style line strip + progress bar. */
export const renderVehicleStrip = (
  label: string,
  headsign: string,
  strip: VehicleStrip,
  onExpand: () => void,
  onClose: () => void,
): TemplateResult => {
  const nextIndex = strip.stops.findIndex((stop) => !stop.passed);
  return html`
    <section class="sheet sheet-strip" data-testid="vehicle-strip" aria-label="Vehicle line">
      <header class="sheet-header">
        <h2 class="sheet-title">
          <span class="line-badge" style="--mode-hue: 210">${label}</span>
          → ${headsign.toLowerCase()}
        </h2>
        <span class="strip-actions">
          <button class="chrome-btn" data-testid="vehicle-strip-expand"
            aria-label="Expand" @click=${onExpand}>▴</button>
          <button class="chrome-btn sheet-close" data-testid="vehicle-strip-close"
            aria-label="Close" @click=${onClose}>✕</button>
        </span>
      </header>
      <div class="strip-progress">
        <span class="strip-progress-fill" style="width: ${strip.fraction * 100}%"></span>
      </div>
      <ol class="strip-rail">
        ${strip.stops.map(
          (stop, index) => html`
            <li class=${classMap({
              'strip-stop': true,
              'is-passed': stop.passed,
              'is-next': index === nextIndex,
            })}>
              <span class="strip-dot"></span>
              <span class="strip-name">${stop.name.toLowerCase()}</span>
            </li>
          `,
        )}
      </ol>
    </section>
  `;
};
