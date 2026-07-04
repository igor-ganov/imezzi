/** data-testid contract shared by the component and E2E specs. */
export const SEARCH_LOCATORS: Readonly<
  Record<'input' | 'results' | 'hit' | 'stopHit' | 'civicHit', string>
> = {
  input: 'search-input',
  results: 'search-results',
  hit: 'search-hit',
  stopHit: 'search-hit-stop',
  civicHit: 'search-hit-civic',
};
