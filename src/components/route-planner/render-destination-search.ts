import { html, type TemplateResult } from 'lit';
import type { CivicHit } from '../../lib/civic/civic-hit.ts';
import { renderResults } from '../search-dock/render-results.ts';

/** Destination lookup: input + civic-aware results (US-1). */
export const renderDestinationSearch = (
  hits: readonly CivicHit[],
  onQuery: (query: string) => void,
  onPick: (hit: CivicHit) => void,
): TemplateResult => html`
  <input
    class="dock-search planner-search"
    type="search"
    placeholder="…or search a destination (20r works)"
    aria-label="Search destination address"
    @input=${(event: Event) =>
      onQuery(
        (event.target instanceof HTMLInputElement && event.target.value) || '',
      )}
  />
  ${renderResults(hits, onPick)}
`;
