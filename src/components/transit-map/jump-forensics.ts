const THRESHOLD_M = 300;

/**
 * Pin the last spike offender on __imezzi.lastJump so an observation
 * session can identify WHICH vehicle/geometry produced it (this is
 * how the barrata-label anchor teleports were caught).
 */
export const recordJump = (
  id: string,
  templateKey: string,
  stepM: number,
  from: readonly [number | undefined, number | undefined],
  to: readonly [number, number],
): void =>
  [stepM]
    .filter((value) => value > THRESHOLD_M)
    .forEach(() =>
      Object.assign(
        (globalThis as { readonly __imezzi?: Record<string, unknown> })
          .__imezzi ?? {},
        {
          lastJump: {
            id,
            stepM: Math.round(stepM),
            from,
            to,
            templateKey,
            at: Date.now(),
          },
        },
      ),
    );
