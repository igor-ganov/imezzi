import { LitElement, html, svg, type TemplateResult } from 'lit';
import { currentPref } from '../lib/theme/current-pref.ts';
import { nextPref } from '../lib/theme/next-pref.ts';
import { applyTheme } from './theme-toggle/apply-theme.ts';

const ICONS: Readonly<Record<string, TemplateResult<2>>> = {
  light: svg`<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>`,
  dark: svg`<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>`,
  system: svg`<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9 21h6M12 17v4"/>`,
};

/** Theme cycle button: light → dark → system (site AC-2.2). */
export class ThemeToggle extends LitElement {
  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private readonly onClick = (event: MouseEvent): void => {
    applyTheme(nextPref(currentPref()), {
      x: event.clientX,
      y: event.clientY,
    });
    this.requestUpdate();
  };

  protected override render(): TemplateResult {
    const pref = currentPref();
    return html`
      <button
        class="chrome-btn"
        data-testid="theme-toggle"
        aria-label="Theme: ${pref} — click to switch"
        title="Theme: ${pref}"
        @click=${this.onClick}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          ${ICONS[pref] ?? ICONS['system']}
        </svg>
      </button>
    `;
  }
}

customElements.define('theme-toggle', ThemeToggle);
