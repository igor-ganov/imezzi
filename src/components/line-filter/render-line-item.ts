import { html, type TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import { MODE_HUES } from '../../lib/map/mode-hues.ts';

/** One toggleable line row in the filter dock. */
export const renderLineItem = (
  line: UiLine,
  selected: boolean,
  onToggle: (key: string) => void,
): TemplateResult => html`
  <li>
    <button
      class=${classMap({ 'line-item': true, 'is-selected': selected })}
      data-testid="filter-line-item"
      data-line-key=${line.key}
      role="switch"
      aria-checked=${selected}
      @click=${() => onToggle(line.key)}
    >
      <span class="line-badge" style="--hue: ${MODE_HUES[line.mode] ?? 208}"
        >${line.label}</span
      >
      <span class="line-item-name">${line.description}</span>
    </button>
  </li>
`;
