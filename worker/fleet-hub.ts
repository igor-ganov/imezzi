import { branch } from '../src/lib/branch.ts';
import type { HubSocket, HubState } from './do-types.ts';
import fleetPlanIds from './fleet-hub/fleet-plan.json';
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
 *
 * The sweep plan is a STATIC snapshot (build-fleet-plan.ts), not a
 * runtime AMT fetch: a colo-pinned `cacheEverything` empty-response
 * poisoning once left the DO's plan empty for days and silently
 * killed the entire live fleet. Importing it removes that failure
 * mode and every plan-fetch subrequest.
 */
export class FleetHub {
  private readonly plan: readonly string[] = fleetPlanIds;
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

  async alarm(): Promise<void> {
    const sockets = this.state.getWebSockets();
    await branch(sockets.length === 0)(
      () => Promise.resolve(),
      async () => {
        this.at = await sweepTick(
          this.state,
          sockets,
          this.plan,
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
