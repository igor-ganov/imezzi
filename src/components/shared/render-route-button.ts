import { html, type TemplateResult } from 'lit';

/** Header "route here" control shared by the stop and civic sheets. */
export const renderRouteButton = (
  testid: string,
  label: string,
  onClick: () => void,
): TemplateResult => html`
  <button
    class="chrome-btn sheet-route"
    data-testid=${testid}
    aria-label=${label}
    title=${label}
    @click=${onClick}
  >
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </svg>
  </button>
`;
