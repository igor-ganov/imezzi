import { branch } from '../src/lib/branch.ts';
import type { HubSocket, HubState } from './do-types.ts';
import { fetchPlan } from './fleet-hub/fetch-plan.ts';
import { hubUpgrade } from './fleet-hub/hub-upgrade.ts';
import { sweepTick, type SweepCursor } from './fleet-hub/sweep-tick.ts';
import type { TickEntry } from './fleet-hub/tick-log.ts';

const HOT_CAP = 60;

/**
 * ONE poller for ALL clients. Sweeps run ONLY while at least one
 * WebSocket is connected — with no sockets the alarm chain does not
 * re-arm, so an unwatched city costs zero invocations and zero
 * upstream traffic. Every tick lands in a persisted ring log
 * (/api/fleet-log) with anomaly stamps; consecutive EMPTY polls back
 * the cadence off until data returns (see sweep-tick.ts).
 */
export class FleetHub {
  private plan: readonly string[] = [];
  private at: SweepCursor = { cursor: 0, emptyStreak: 0 };
  private hot: readonly string[] = [];

  constructor(private readonly state: HubState) {}

  async fetch(request: Request): Promise<Response> {
    const wantsLog = new URL(request.url).pathname === '/api/fleet-log';
    return branch(wantsLog)(
      async () =>
        Response.json(
          (await this.state.storage.get<readonly TickEntry[]>('log')) ?? [],
        ),
      () => Promise.resolve(hubUpgrade(request, this.state)),
    );
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
        this.at = await sweepTick(
          this.state,
          sockets,
          await this.planOnce(),
          this.at,
          this.hot,
        );
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
