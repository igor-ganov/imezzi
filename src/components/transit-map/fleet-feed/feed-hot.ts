import { branch } from '../../../lib/branch.ts';
import { appState } from '../../../lib/store/app-state.ts';
import type { FeedState } from './feed-socket.ts';

const HOT_THROTTLE_MS = 15000;

/** Forward hot stops to the hub, throttled, only on an open link. */
export const wireHotStops = (state: FeedState): void => {
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
};
