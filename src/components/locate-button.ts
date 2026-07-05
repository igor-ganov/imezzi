import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { branch } from '../lib/branch.ts';
import { runLocate } from './locate-button/locate-flow.ts';

const TOAST_MS = 4200;

/** Center-on-me control with explicit permission feedback (site US-1). */
export class LocateButton extends LitElement {
  @state() declare busy: boolean;
  @state() declare toast: string;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    super();
    this.busy = false;
    this.toast = '';
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private readonly onClick = (): void =>
    runLocate({
      setBusy: (busy) => {
        this.busy = busy;
      },
      setToast: (message) => {
        this.toast = message;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.toast = '';
        }, TOAST_MS);
      },
    });

  protected override render(): TemplateResult {
    return html`
      <button
        class=${classMap({ 'chrome-btn': true, 'locate-busy': this.busy })}
        data-testid="locate-button"
        aria-label="Find my location"
        title="Find my location"
        @click=${this.onClick}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
      ${branch(this.toast === '')(
        () => html``,
        () =>
          html`<div class="map-toast" data-testid="locate-toast">
            ${this.toast}
          </div>`,
      )}
    `;
  }
}

customElements.define('locate-button', LocateButton);
