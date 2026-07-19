import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { branch } from '../../lib/branch.ts';
import type { LineDiagram } from '../../lib/fleet/line-diagram.ts';
import { sheetIcons } from './icons.ts';

const at = (position: number): string =>
  `calc(var(--step) * ${position} + var(--step) / 2)`;

/** Let long "Street/Corner" names wrap at the slash, not mid-word by
 *  appending a zero-width space (an invisible break opportunity). */
const wrappable = (name: string): string =>
  name.toLowerCase().replaceAll('/', `/${String.fromCharCode(0x200b)}`);

const stopItem = (name: string, index: number, diagram: LineDiagram): TemplateResult => html`
  <li class=${classMap({
    'diag-stop': true,
    'is-behind': index < diagram.at,
    'is-reached': index <= diagram.at,
    'is-flank': index === diagram.at || index === diagram.at + 1,
    'is-me': index === diagram.meAt,
  })}>
    <span class="diag-dot"></span>
    <span class="diag-name">${wrappable(name)}</span>
  </li>
`;

const meMarker = (diagram: LineDiagram): TemplateResult =>
  branch(diagram.meAt >= 0)(
    () =>
      html`<span class="diag-me" style="left: ${at(diagram.meAt)}" title="You are here">
        ${sheetIcons.me}
      </span>`,
    () => html``,
  );

/** The line diagram body: the rail of stops, the vehicle on its leg,
 *  and the user marker. */
export const renderDiagram = (diagram: LineDiagram): TemplateResult => html`
  <div class="diagram" data-testid="line-diagram">
    <ol class="diag-track">
      ${diagram.stops.map((name, index) => stopItem(name, index, diagram))}
      <span class="diag-bus" style="left: ${at(diagram.at + diagram.fraction)}">
        ${sheetIcons.bus}
      </span>
      ${meMarker(diagram)}
    </ol>
  </div>
`;
