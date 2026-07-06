export type FeedAction = 'none' | 'connect' | 'recycle';

const STALL_MS = 45000;

/**
 * What the feed should do right now. Pure — this is the resume/
 * watchdog brain, and it exists because the naive check ("is there
 * a socket object?") froze the app: on screen-on the CLOSING socket
 * from screen-off still existed, so nothing reconnected, and its
 * late onclose was muted. Decisions:
 * - hidden tabs do nothing (the hub stops polling for them);
 * - no socket at all → connect;
 * - a socket that is not OPEN (closing/stuck connecting) → recycle
 *   (close the remains, connect fresh);
 * - an OPEN socket that has delivered nothing for STALL_MS → recycle
 *   (half-dead connection or a stalled hub);
 * - an OPEN, recently-fed socket → none.
 */
export const feedDecision = (
  hidden: boolean,
  readyState: number | undefined,
  msSinceData: number,
): FeedAction => {
  const stalled = msSinceData >= STALL_MS;
  const byState: Readonly<Record<string, FeedAction>> = {
    // A fresh CONNECTING has its own 4 s handshake guard and retry
    // ladder — recycling it would kill legitimate slow connects.
    [`${WebSocket.CONNECTING}`]: 'none',
    [`${WebSocket.OPEN}`]: { true: 'recycle' as const, false: 'none' as const }[
      `${stalled}`
    ],
    [`${WebSocket.CLOSING}`]: 'recycle',
    [`${WebSocket.CLOSED}`]: 'recycle',
  };
  return {
    true: 'none' as const,
    false: byState[`${readyState}`] ?? 'connect',
  }[`${hidden}`];
};
