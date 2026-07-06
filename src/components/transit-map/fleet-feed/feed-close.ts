import { branch } from '../../../lib/branch.ts';
import type { FeedState } from './feed-socket.ts';

const MAX_FAILURES = 3;
const RETRY_MS = 3000;

/**
 * Close bookkeeping: a LATE close of an old socket must not clobber
 * its successor; intentional (mute/recycle) closes do not count as
 * failures and never retry; real failures climb the retry ladder to
 * the fallback.
 */
export const onFeedClose = (
  state: FeedState,
  socket: WebSocket,
  reconnect: () => void,
  fallback: () => void,
): void => {
  state.socket = { true: undefined, false: state.socket }[
    `${state.socket === socket}`
  ];
  const intentional = state.muted === socket;
  state.muted = { true: undefined, false: state.muted }[`${intentional}`];
  state.failures += { true: 0, false: 1 }[`${intentional}`] ?? 1;
  const retry = (): void =>
    void setTimeout(
      () =>
        branch(document.hidden || state.socket !== undefined)(
          () => undefined,
          reconnect,
        ),
      RETRY_MS,
    );
  branch(intentional)(
    () => undefined,
    () => branch(state.failures >= MAX_FAILURES)(fallback, retry),
  );
};
