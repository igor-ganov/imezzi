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
    /** The count invariant: unique vehicles in data vs markers drawn. */
    fleet: (computed: number, rendered: number, ghosts: number): void => {
      host?.setAttribute('data-fleet-computed', `${computed}`);
      host?.setAttribute('data-live-rendered', `${rendered}`);
      host?.setAttribute('data-ghosts', `${ghosts}`);
    },
    /** Worst per-frame glide step over the last seconds, metres. */
    maxStep: (meters: number): void => {
      host?.setAttribute('data-max-step-m', `${Math.round(meters)}`);
    },
    routeLegs: (count: number): void => {
      host?.setAttribute('data-route-legs', `${count}`);
    },
  };
};
