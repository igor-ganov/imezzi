import { html, type TemplateResult } from 'lit';
import { filterLines } from '../../lib/lines/filter-lines.ts';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import type { DockActions } from './dock-actions.ts';
import { renderDockHead } from './render-dock-head.ts';
import { renderSection } from './render-section.ts';

export type { DockActions } from './dock-actions.ts';

const MODE_TITLES: readonly (readonly [string, string])[] = [
  ['metro', 'Metro'],
  ['funicular', 'Funiculars & rack'],
  ['lift', 'Public lifts'],
  ['train', 'Railways'],
  ['boat', 'Navebus'],
  ['bus', 'Buses'],
];

/** Filter dock: search box, clear control, lines grouped by mode. */
export const renderDock = (
  lines: readonly UiLine[],
  selected: ReadonlySet<string>,
  query: string,
  actions: DockActions,
): TemplateResult => {
  const visible = filterLines(lines, query);
  return html`
    <section class="dock" aria-label="Line filter">
      ${renderDockHead(query, selected.size, actions)}
      <div class="dock-body">
        ${MODE_TITLES.map(([mode, title]) =>
          renderSection(
            title,
            visible.filter((line) => line.mode === mode),
            selected,
            actions.onToggle,
          ),
        )}
      </div>
    </section>
  `;
};
