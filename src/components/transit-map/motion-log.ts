export interface MotionSample {
  readonly t: number;
  readonly stepM: number;
  /** Frame dt when the worst step landed — m/frame is meaningless
   *  without it (background rAF throttling stretches frames). */
  readonly dtMs: number;
  readonly vehicles: number;
  /** Cumulative snap relocations (anomalous data corrections). */
  readonly snaps: number;
}

const CAP = 240;
const SAMPLE_MS = 1000;

/**
 * Client-side motion telemetry: one sample per second (worst glide
 * step + fleet size), ring-buffered on __imezzi.motionLog so a live
 * observation session can quantify smoothness instead of eyeballing.
 */
export const makeMotionLog = () => {
  const ring: MotionSample[] = [];
  const state = { lastAt: 0, worst: 0 };
  const bag =
    (globalThis as { readonly __imezzi?: Record<string, unknown> }).__imezzi ??
    {};
  Object.assign(bag, { motionLog: ring });
  return (
    stepM: number,
    vehicles: number,
    dtMs: number,
    snaps: number,
  ): void => {
    state.worst = Math.max(state.worst, stepM);
    const due = Date.now() - state.lastAt >= SAMPLE_MS;
    [due]
      .filter((value) => value)
      .forEach(() => {
        ring.push({ t: Date.now(), stepM: state.worst, dtMs, vehicles, snaps });
        ring.splice(0, Math.max(ring.length - CAP, 0));
        state.lastAt = Date.now();
        state.worst = 0;
      });
  };
};
