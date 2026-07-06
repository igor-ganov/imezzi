import type { FleetMotion } from '../../lib/fleet/fleet-motion.ts';
import type { VehicleView } from '../../lib/vehicles/types.ts';
import { bindKeyOf } from './bind-key-of.ts';
import type { FleetFrame } from './fleet-frame.ts';
import { publishFrameDebug } from './frame-forensics.ts';
import { makeMotionLog } from './motion-log.ts';
import { makeStepMeter } from './measure-steps.ts';

/**
 * All per-frame measurement in one place: the glide step meter
 * (snap/anchor/road changes count as re-binds), the per-second
 * motion log and the frameDebug snapshot.
 */
export const makeFrameTelemetry = (reportStep: (meters: number) => void) => {
  const measure = makeStepMeter();
  const record = makeMotionLog();
  return (
    frame: FleetFrame,
    motion: FleetMotion,
    views: readonly VehicleView[],
    timeMs: number,
    dt: number,
  ): void => {
    const worst = measure(
      views.map((view, index) => ({
        id: view.id,
        templateKey: bindKeyOf(
          frame.targets[index],
          motion.get(view.id)?.snaps ?? 0,
        ),
        lon: view.lon,
        lat: view.lat,
      })),
      timeMs,
    );
    reportStep(worst);
    record(
      worst,
      views.length,
      Math.round(dt * 1000),
      [...motion.values()].reduce((sum, entry) => sum + entry.snaps, 0),
    );
    publishFrameDebug(frame.targets, motion, dt);
  };
};
