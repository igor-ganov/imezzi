/** data-testid contract shared by the planner and E2E specs. */
export const PLANNER_LOCATORS: Readonly<
  Record<
    | 'fab'
    | 'panel'
    | 'pickOrigin'
    | 'pickDestination'
    | 'locate'
    | 'destinationInput'
    | 'altChip'
    | 'clear'
    | 'busy',
    string
  >
> = {
  fab: 'route-fab',
  panel: 'route-panel',
  pickOrigin: 'pick-origin',
  pickDestination: 'pick-destination',
  locate: 'use-my-location',
  destinationInput: 'destination-input',
  altChip: 'alt-chip',
  clear: 'route-clear',
  busy: 'route-busy',
};
