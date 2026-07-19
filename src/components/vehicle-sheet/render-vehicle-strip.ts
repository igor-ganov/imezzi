import { html, type TemplateResult } from 'lit';
import type { LineDiagram } from '../../lib/fleet/line-diagram.ts';
import { sheetIcons } from './icons.ts';
import { renderDiagram } from './render-diagram.ts';

/**
 * Collapsed vehicle sheet: the whole route as a metro line diagram —
 * every stop on one rail, the vehicle riding between its two current
 * stops, and a marker for where the user stands on the same line.
 */
export const renderVehicleStrip = (
  label: string,
  headsign: string,
  diagram: LineDiagram,
  onExpand: () => void,
  onClose: () => void,
): TemplateResult => html`
  <section class="sheet sheet-strip" data-testid="vehicle-strip" aria-label="Vehicle line">
    <header class="sheet-header">
      <h2 class="sheet-title">
        <span class="line-badge" style="--mode-hue: 210">${label}</span>
        → ${headsign.toLowerCase()}
      </h2>
      <span class="strip-actions">
        <button class="chrome-btn" data-testid="vehicle-strip-expand"
          aria-label="Expand" @click=${onExpand}>${sheetIcons.expand}</button>
        <button class="chrome-btn" data-testid="vehicle-strip-close"
          aria-label="Close" @click=${onClose}>${sheetIcons.close}</button>
      </span>
    </header>
    ${renderDiagram(diagram)}
  </section>
`;
