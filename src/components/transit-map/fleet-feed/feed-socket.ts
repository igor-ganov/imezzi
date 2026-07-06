import type { FleetSighting } from '../../../lib/fleet/types.ts';
import { applyPortion } from './apply-portion.ts';
import { onFeedClose } from './feed-close.ts';

export interface FeedState {
  failures: number;
  /** The socket whose close was intentional (mute/recycle). */
  muted: WebSocket | undefined;
  socket: WebSocket | undefined;
  hotAt: number;
  dataAt: number;
  /** The batch poller took over — stop all socket activity. */
  fallenBack: boolean;
}

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
    state.dataAt = Date.now();
    const portion: { readonly sightings?: readonly FleetSighting[] } =
      JSON.parse(`${event.data}`);
    applyPortion(portion.sightings ?? []);
  };
  socket.onclose = () => {
    clearTimeout(guard);
    onFeedClose(state, socket, () => connectFeed(state, fallback), fallback);
  };
};
