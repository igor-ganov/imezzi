/**
 * DOM state contract for E2E (playwright rules: out-of-band data must
 * surface as DOM state). The island exposes readiness and data
 * arrival as attributes on <transit-map>.
 */
export const makeStateMarker = (container: HTMLElement) => {
  const host = container.closest('transit-map');
  return {
    ready: (): void => {
      host?.setAttribute('data-ready', 'true');
    },
    stops: (count: number): void => {
      host?.setAttribute('data-stops', `${count}`);
    },
    stopsRendered: (): void => {
      host?.setAttribute('data-stops-rendered', 'true');
    },
    vehicles: (count: number): void => {
      host?.setAttribute('data-vehicles', `${count}`);
    },
    routeLegs: (count: number): void => {
      host?.setAttribute('data-route-legs', `${count}`);
    },
  };
};
