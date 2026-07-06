import { branch } from '../../lib/branch.ts';
import { feedDecision } from './fleet-feed/feed-decision.ts';
import { wireHotStops } from './fleet-feed/feed-hot.ts';
import { connectFeed, type FeedState } from './fleet-feed/feed-socket.ts';
import { startFleetPoller } from './fleet-poller.ts';

const WATCHDOG_MS = 10000;

/**
 * Live fleet transport: ONE WebSocket to the FleetHub Durable Object
 * (the shared server-side city poller). Hidden tabs disconnect
 * deliberately; on EVERY resume signal (visibility, and a 10 s
 * watchdog for everything else) the pure feedDecision picks connect/
 * recycle/none — screen-off→on used to freeze the app because the
 * dying socket still "existed". Repeated failures fall back to the
 * batch poller for the session.
 */
export const startFleetFeed = (): void => {
  const state: FeedState = {
    failures: 0,
    muted: undefined,
    socket: undefined,
    hotAt: 0,
    dataAt: Date.now(),
    fallenBack: false,
  };
  const fallback = (): void => {
    state.fallenBack = true;
    startFleetPoller();
  };
  const recycle = (): void => {
    state.muted = state.socket;
    state.socket?.close();
    connectFeed(state, fallback);
    state.dataAt = Date.now();
  };
  const act = (): void => {
    const action = feedDecision(
      document.hidden || state.fallenBack,
      state.socket?.readyState,
      Date.now() - state.dataAt,
    );
    ({
      none: () => undefined,
      connect: () => connectFeed(state, fallback),
      recycle,
    })[action]();
  };
  document.addEventListener('visibilitychange', () =>
    branch(document.hidden)(
      () => {
        state.muted = state.socket;
        state.socket?.close();
      },
      act,
    ),
  );
  globalThis.setInterval(act, WATCHDOG_MS);
  wireHotStops(state);
  connectFeed(state, fallback);
};
