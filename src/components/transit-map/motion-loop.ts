import type { FleetMotion } from '../../lib/fleet/fleet-motion.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import type { FleetFrame } from './fleet-frame.ts';
import { materializeFrame } from './materialize-frame.ts';
import { makeStepMeter } from './measure-steps.ts';

/**
 * Render loop in TIMELINE SPACE: each frame the displayed moments
 * chase the targets (rate-capped, monotonic, stale-frozen) and are
 * materialized through the route geometry — catch-ups drive along
 * the street, chord teleports are impossible by construction. With
 * prefers-reduced-motion, targets are adopted directly.
 */
export const makeMotionLoop = (
  render: (views: readonly VehicleView[]) => void,
  reportStep: (meters: number) => void,
) => {
  const state = {
    frame: undefined as FleetFrame | undefined,
    motion: new Map() as FleetMotion,
    lastFrame: 0,
  };
  const measure = makeStepMeter();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tick = (time: number): void => {
    const dt = Math.min(Math.max(time - state.lastFrame, 0) / 1000, 0.5);
    state.lastFrame = time;
    [state.frame]
      .filter((frame): frame is FleetFrame => frame !== undefined)
      .forEach((frame) => {
        const { motion, views } = materializeFrame(
          state.motion,
          frame,
          dt,
          reduced.matches,
        );
        state.motion = motion;
        reportStep(
          measure(
            views.map((view, index) => ({
              id: view.id,
              templateKey: frame.targets[index]?.templateKey ?? '',
              lon: view.lon,
              lat: view.lat,
            })),
            time,
          ),
        );
        render([...frame.schedule, ...views]);
      });
    requestAnimationFrame(tick);
  };
  return {
    setFrame: (frame: FleetFrame): void => {
      state.frame = frame;
    },
    start: (): void => {
      requestAnimationFrame(tick);
    },
  };
};
