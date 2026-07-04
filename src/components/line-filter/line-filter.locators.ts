/** data-testid contract shared by the filter and E2E specs. */
export const FILTER_LOCATORS: Readonly<
  Record<'fab' | 'dock' | 'search' | 'item' | 'clear' | 'count', string>
> = {
  fab: 'filter-fab',
  dock: 'filter-dock',
  search: 'filter-search',
  item: 'filter-line-item',
  clear: 'filter-clear',
  count: 'filter-count',
};
