import { smoothStep, type MotionPoint } from '../../lib/motion/smooth-step.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';

/**
 * Display layer: computed targets update on the data tick, but the
 * markers users see are advanced every animation frame by the
 * smoother — steady glide, no teleports, stale points settle to a
 * stop (site AC-3.1). With prefers-reduced-motion the targets render
 * directly (positions jump, per site AC-4.2).
 */
export const makeMotionLoop = (
  render: (views: readonly VehicleView[]) => void,
) => {
  const state = {
    targets: [] as readonly VehicleView[],
    displayed: new Map<string, MotionPoint>() as ReadonlyMap<
      string,
      MotionPoint
    >,
    lastFrame: 0,
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const smoothed = (dt: number): readonly VehicleView[] => {
    state.displayed = smoothStep(state.displayed, state.targets, dt);
    return state.targets.map((target) => ({
      ...target,
      lon: state.displayed.get(target.id)?.lon ?? target.lon,
      lat: state.displayed.get(target.id)?.lat ?? target.lat,
    }));
  };
  const tick = (time: number): void => {
    const dt = Math.min(Math.max(time - state.lastFrame, 0) / 1000, 0.5);
    state.lastFrame = time;
    render(
      { true: () => state.targets, false: () => smoothed(dt) }[
        `${reduced.matches}`
      ](),
    );
    requestAnimationFrame(tick);
  };
  return {
    setTargets: (targets: readonly VehicleView[]): void => {
      state.targets = targets;
    },
    start: (): void => {
      requestAnimationFrame(tick);
    },
  };
};
