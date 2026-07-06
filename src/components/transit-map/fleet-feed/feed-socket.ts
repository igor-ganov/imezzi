import { branch } from '../../../lib/branch.ts';
import type { FleetSighting } from '../../../lib/fleet/types.ts';
import { applyPortion } from './apply-portion.ts';

export interface FeedState {
  failures: number;
  muted: boolean;
  socket: WebSocket | undefined;
  hotAt: number;
}

const MAX_FAILURES = 3;
const RETRY_MS = 3000;
const CONNECT_TIMEOUT_MS = 4000;

/** Open the hub socket; retries, mute-aware close, fallback hook. */
export const connectFeed = (state: FeedState, fallback: () => void): void => {
  const socket = new WebSocket(
    `${location.origin.replace(/^http/, 'ws')}/api/fleet-ws`,
  );
  state.socket = socket;
  // A server that neither accepts nor rejects the upgrade would hang
  // the attempt forever — no close event, no failure count, no
  // fallback. Cap the handshake.
  const guard = setTimeout(
    () =>
      ({ true: () => undefined, false: () => socket.close() })[
        `${socket.readyState === WebSocket.OPEN}`
      ]?.(),
    CONNECT_TIMEOUT_MS,
  );
  socket.onopen = () => clearTimeout(guard);
  socket.onmessage = (event) => {
    state.failures = 0;
    const portion: { readonly sightings?: readonly FleetSighting[] } =
      JSON.parse(`${event.data}`);
    applyPortion(portion.sightings ?? []);
  };
  socket.onclose = () => {
    clearTimeout(guard);
    state.socket = undefined;
    state.failures += { true: 0, false: 1 }[`${state.muted}`] ?? 1;
    const retry = (): void =>
      void setTimeout(
        () =>
          branch(document.hidden)(
            () => undefined,
            () => connectFeed(state, fallback),
          ),
        RETRY_MS,
      );
    branch(state.muted)(
      () => undefined,
      () => branch(state.failures >= MAX_FAILURES)(fallback, retry),
    );
    state.muted = false;
  };
};
