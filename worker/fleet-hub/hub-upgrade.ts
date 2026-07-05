import { branch } from '../../src/lib/branch.ts';
import type { HubResponseInit, HubState, SocketPair } from '../do-types.ts';

declare const WebSocketPair: new () => SocketPair;

/** Upgrade a request into a hibernating hub socket (or 426). */
export const hubUpgrade = (request: Request, state: HubState): Response =>
  branch(request.headers.get('Upgrade') === 'websocket')(
    () => {
      const pair = new WebSocketPair();
      state.acceptWebSocket(pair[1]);
      state.storage.setAlarm(Date.now());
      const init: HubResponseInit = { status: 101, webSocket: pair[0] };
      return new Response(null, init);
    },
    () => new Response('Expected a WebSocket upgrade', { status: 426 }),
  );
