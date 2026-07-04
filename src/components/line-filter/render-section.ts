import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import type { UiLine } from '../../lib/lines/ui-line.ts';
import { renderLineItem } from './render-line-item.ts';

/** One mode group (heading + list) in the dock, empty when no match. */
export const renderSection = (
  title: string,
  group: readonly UiLine[],
  selected: ReadonlySet<string>,
  onToggle: (key: string) => void,
): TemplateResult =>
  branch(group.length > 0)(
    () => html`
      <h3 class="dock-section">${title}</h3>
      <ul class="dock-list">
        ${group.map((line) =>
          renderLineItem(line, selected.has(line.key), onToggle),
        )}
      </ul>
    `,
    () => html``,
  );
