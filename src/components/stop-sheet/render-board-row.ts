import { html, type TemplateResult } from 'lit';
import type { BoardRow } from '../../lib/arrivals/board-row.ts';
import { formatEta } from '../../lib/arrivals/format-eta.ts';
import { MODE_HUES } from '../../lib/map/mode-hues.ts';
import { branch } from '../../lib/branch.ts';
import { onRowClick } from './row-click.ts';

const statusBadge = (row: BoardRow): TemplateResult =>
  branch(row.approximated)(
    () =>
      html`<span
        class="badge-approx"
        title="Approximated from the timetable — no live signal"
        aria-label="approximated"
        >!</span
      >`,
    () =>
      html`<span
        class="badge-live"
        title="Live prediction"
        aria-label="live"
      ></span>`,
  );

const fullBadge = (row: BoardRow): TemplateResult =>
  branch(row.full)(
    () => html`<span class="badge-full" title="Bus is full">full</span>`,
    () => html``,
  );

/**
 * One departure-board row: badge, destination, status, ETA. A live
 * row is a button — tapping it opens ITS vehicle's sheet.
 */
export const renderBoardRow = (row: BoardRow): TemplateResult => html`
  <li>
    <button
      class="board-row"
      data-testid="board-row"
      data-line=${row.line}
      data-approximated=${row.approximated}
      data-vehicle=${row.vehicle}
      ?disabled=${row.vehicle === '' || row.approximated}
      @click=${() => onRowClick(row)}
    >
      <span class="line-badge" style="--hue: ${MODE_HUES[row.mode] ?? 208}"
        >${row.line}</span
      >
      <span class="board-destination">${row.destination.toLowerCase()}</span>
      ${fullBadge(row)} ${statusBadge(row)}
      <span class="board-eta">${formatEta(row.etaSeconds)}</span>
    </button>
  </li>
`;
