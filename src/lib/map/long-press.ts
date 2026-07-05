const HOLD_MS = 600;
const DRIFT_PX = 12;

/**
 * Touch long-press for map canvases: fires the callback with client
 * coordinates when a single finger holds ~600 ms without drifting
 * (touch browsers do not synthesize contextmenu on MapLibre's
 * canvas). Returns the teardown.
 */
export const onLongPress = (
  target: HTMLElement,
  fire: (clientX: number, clientY: number) => void,
): (() => void) => {
  const state: {
    timer?: ReturnType<typeof setTimeout>;
    x: number;
    y: number;
  } = { x: 0, y: 0 };
  const cancel = (): void => clearTimeout(state.timer);
  const start = (event: TouchEvent): void => {
    const touch = event.touches[0];
    cancel();
    [touch]
      .filter(
        (value): value is Touch =>
          value !== undefined && event.touches.length === 1,
      )
      .forEach((value) => {
        state.x = value.clientX;
        state.y = value.clientY;
        state.timer = setTimeout(() => fire(state.x, state.y), HOLD_MS);
      });
  };
  const move = (event: TouchEvent): void => {
    const touch = event.touches[0];
    const drifted =
      Math.hypot(
        (touch?.clientX ?? 0) - state.x,
        (touch?.clientY ?? 0) - state.y,
      ) > DRIFT_PX;
    ({ true: cancel, false: () => undefined })[`${drifted}`]();
  };
  target.addEventListener('touchstart', start, { passive: true });
  target.addEventListener('touchmove', move, { passive: true });
  target.addEventListener('touchend', cancel);
  target.addEventListener('touchcancel', cancel);
  return (): void => {
    cancel();
    target.removeEventListener('touchstart', start);
    target.removeEventListener('touchmove', move);
    target.removeEventListener('touchend', cancel);
    target.removeEventListener('touchcancel', cancel);
  };
};
