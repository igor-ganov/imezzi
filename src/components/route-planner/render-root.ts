import { html, type TemplateResult } from 'lit';
import { branch } from '../../lib/branch.ts';
import { renderPanel, type PanelActions } from './render-panel.ts';
import type { RoutePlannerHost } from './planner-host.ts';
import { PLANNER_LOCATORS } from './route-planner.locators.ts';

/** Route FAB + panel (open state). */
export const renderPlannerRoot = (
  host: RoutePlannerHost,
  onFab: () => void,
  actions: PanelActions,
): TemplateResult => html`
  <button
    class="chrome-btn fab-route"
    data-testid=${PLANNER_LOCATORS.fab}
    aria-label="Plan a route"
    aria-expanded=${host.open}
    @click=${onFab}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </svg>
  </button>
  ${branch(host.open)(
    () => renderPanel(host, actions),
    () => html``,
  )}
`;
