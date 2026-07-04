import { LitElement, html, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { debounce } from '../lib/debounce.ts';
import { combinedSearch } from '../lib/search/combined-search.ts';
import type { SearchHit } from '../lib/search/search-hit.ts';
import { pickHit } from './search-dock/pick-hit.ts';
import { renderResults } from './search-dock/render-results.ts';
import { SEARCH_LOCATORS } from './search-dock/search-dock.locators.ts';

/** Address + stop search box (civic-addresses US-2, live-map US-3). */
export class SearchDock extends LitElement {
  @state() declare hits: readonly SearchHit[];

  constructor() {
    super();
    this.hits = [];
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  private readonly run = debounce(350, (query: string) => {
    void {
      true: async () => {
        this.hits = await combinedSearch(query).catch(
          (): readonly SearchHit[] => [],
        );
      },
      false: () => {
        this.hits = [];
      },
    }[`${query.trim().length >= 3}`]();
  });

  private readonly onPick = (hit: SearchHit): void => {
    pickHit(hit);
    this.hits = [];
  };

  protected override render(): TemplateResult {
    return html`
      <div class="search-wrap">
        <input
          class="search-input"
          data-testid=${SEARCH_LOCATORS.input}
          type="search"
          placeholder="Stop, address, 20r…"
          aria-label="Search a stop or a Genoa address (red numbers with r)"
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
