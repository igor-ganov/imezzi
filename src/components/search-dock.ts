import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import type { CivicHit } from '../lib/civic/civic-hit.ts';
import { searchCivics } from '../lib/civic/search-civics.ts';
import { debounce } from '../lib/debounce.ts';
import { appState } from '../lib/store/app-state.ts';
import { renderResults } from './search-dock/render-results.ts';

/** Civic-aware address search box (civic-addresses US-2). */
export class SearchDock extends LitElement {
  @state() declare hits: readonly CivicHit[];

  constructor() {
    super();
    this.hits = [];
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private readonly run = debounce(350, (query: string) => {
    const wanted = query.trim().length >= 3;
    void { true: async () => {
      this.hits = await searchCivics(query).catch(
        (): readonly CivicHit[] => [],
      );
    }, false: () => {
      this.hits = [];
    } }[`${wanted}`]();
  });

  private readonly onPick = (hit: CivicHit): void => {
    appState.searchPin.set(hit);
    appState.activeCivic.set(hit);
    this.hits = [];
  };

  protected override render(): TemplateResult {
    return html`
      <div class="search-wrap">
        <input
          class="search-input"
          type="search"
          placeholder="Via XX Settembre 20r…"
          aria-label="Search a Genoa address (red numbers with r)"
          @input=${(event: Event) =>
            this.run(
              (event.target instanceof HTMLInputElement &&
                event.target.value) ||
                '',
            )}
        />
        ${renderResults(this.hits, this.onPick)}
      </div>
    `;
  }
}

customElements.define('search-dock', SearchDock);
