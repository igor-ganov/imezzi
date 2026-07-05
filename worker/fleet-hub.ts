import { branch } from '../src/lib/branch.ts';
import type { HubSocket, HubState } from './do-types.ts';
import { fetchPlan } from './fleet-hub/fetch-plan.ts';
import { hubUpgrade } from './fleet-hub/hub-upgrade.ts';
import { pollPortion } from './fleet-hub/poll-portion.ts';
import { nextSlice } from './fleet-hub/rotation.ts';

const PORTION = 45;
const TICK_MS = 5000;
const HOT_CAP = 60;

/**
 * ONE poller for ALL clients (quota economics: the per-tab sweep
 * burned the account's daily invocation quota). While at least one
 * WebSocket is connected an alarm chain sweeps the city and
 * broadcasts each portion; with no sockets the chain simply does not
 * re-arm — an unwatched city costs zero invocations. Hibernation
 * keeps idle sockets free; in-memory state (plan/cursor/hot) is
 * disposable — after an eviction the sweep refills within a cycle.
 */
export class FleetHub {
  private plan: readonly string[] = [];
  private cursor = 0;
  private hot: readonly string[] = [];

  constructor(private readonly state: HubState) {}

  fetch(request: Request): Response {
    return hubUpgrade(request, this.state);
  }

  private async planOnce(): Promise<readonly string[]> {
    this.plan = await branch(this.plan.length === 0)(fetchPlan, () =>
      Promise.resolve(this.plan),
    );
    return this.plan;
  }

  async alarm(): Promise<void> {
    const sockets = this.state.getWebSockets();
    await branch(sockets.length === 0)(
      () => Promise.resolve(),
      async () => {
        const { slice, cursor } = nextSlice(
          await this.planOnce(),
          this.cursor,
          this.hot,
          PORTION,
        );
        this.cursor = cursor;
        const sightings = await pollPortion(slice);
        const payload = JSON.stringify({ type: 'portion', sightings });
        sockets.forEach((socket) => socket.send(payload));
        this.state.storage.setAlarm(Date.now() + TICK_MS);
      },
    );
  }

  webSocketMessage(socket: HubSocket, message: string | ArrayBuffer): void {
    const parsed: { readonly hotStops?: readonly string[] } = JSON.parse(
      `${message}`,
    );
    this.hot = [...new Set(parsed.hotStops ?? [])]
      .filter((id) => /^\d{1,6}$/.test(id))
      .slice(0, HOT_CAP);
  }
}
