/**
 * Minimal Durable Object surface typings (the project does not pull
 * @cloudflare/workers-types; only what FleetHub touches is declared).
 */
export interface HubSocket {
  readonly send: (data: string) => void;
  readonly close: (code?: number) => void;
}

export interface HubState {
  readonly acceptWebSocket: (ws: HubSocket) => void;
  readonly getWebSockets: () => readonly HubSocket[];
  readonly storage: {
    readonly setAlarm: (at: number) => void;
    readonly getAlarm: () => Promise<number | null>;
  };
}

export interface SocketPair {
  readonly 0: HubSocket;
  readonly 1: HubSocket;
}

export interface HubResponseInit extends ResponseInit {
  readonly webSocket: HubSocket;
}
