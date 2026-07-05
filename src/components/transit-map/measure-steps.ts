import { recordJump } from './jump-forensics.ts';

export interface StepSample {
  readonly id: string;
  readonly templateKey: string;
  readonly lon: number;
  readonly lat: number;
}

const METERS_PER_DEGREE = 111000;
const WINDOW_MS = 5000;

/**
 * Frame-to-frame displacement meter (data-max-step-m, guarded by
 * E2E): the worst glide step over the last few seconds. First
 * appearances and direction re-assignments are excluded — those are
 * legitimate discrete re-bindings, not motion; everything else must
 * stay in glide range or it IS a teleport.
 */
export const makeStepMeter = () => {
  const state = {
    last: new Map<string, StepSample>(),
    window: [] as readonly { t: number; worst: number }[],
  };
  return (samples: readonly StepSample[], timeMs: number): number => {
    const worst = samples.reduce((max, sample) => {
      const previous = state.last.get(sample.id);
      const comparable =
        previous !== undefined && previous.templateKey === sample.templateKey;
      const step =
        Math.hypot(
          sample.lon - (previous?.lon ?? sample.lon),
          sample.lat - (previous?.lat ?? sample.lat),
        ) * METERS_PER_DEGREE;
      const counted = { true: step, false: 0 }[`${comparable}`] ?? 0;
      recordJump(
        sample.id,
        sample.templateKey,
        counted,
        [previous?.lon, previous?.lat],
        [sample.lon, sample.lat],
      );
      return Math.max(max, counted);
    }, 0);
    state.last = new Map(samples.map((sample) => [sample.id, sample]));
    state.window = [
      ...state.window.filter((entry) => timeMs - entry.t <= WINDOW_MS),
      { t: timeMs, worst },
    ];
    return state.window.reduce((max, entry) => Math.max(max, entry.worst), 0);
  };
};
