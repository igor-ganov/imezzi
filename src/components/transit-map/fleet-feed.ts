import { branch } from '../../lib/branch.ts';
import { appState } from '../../lib/store/app-state.ts';
import { connectFeed, type FeedState } from './fleet-feed/feed-socket.ts';
import { startFleetPoller } from './fleet-poller.ts';

const HOT_THROTTLE_MS = 15000;

/**
 * Live fleet transport: ONE WebSocket to the FleetHub Durable Object
 * (the shared server-side city poller) instead of each tab sweeping
 * 923 stops itself. Hidden tabs disconnect deliberately (the hub
 * stops polling when its last socket leaves — an unwatched city
 * costs zero). If the socket fails repeatedly the batch poller takes
 * over for the session, so the map works where WebSockets do not.
 */
export const startFleetFeed = (): void => {
  const state: FeedState = {
    failures: 0,
    muted: false,
    socket: undefined,
    hotAt: 0,
  };
  document.addEventListener('visibilitychange', () =>
    branch(document.hidden)(
      () => {
        state.muted = state.socket !== undefined;
        state.socket?.close();
      },
      () =>
        branch(state.socket !== undefined)(
          () => undefined,
          () => connectFeed(state, startFleetPoller),
        ),
    ),
  );
  appState.hotStops.subscribe((hot) => {
    const due = Date.now() - state.hotAt >= HOT_THROTTLE_MS;
    branch(due && state.socket?.readyState === WebSocket.OPEN)(
      () => {
        state.hotAt = Date.now();
        state.socket?.send(JSON.stringify({ hotStops: hot }));
      },
      () => undefined,
    );
  });
  connectFeed(state, startFleetPoller);
};
