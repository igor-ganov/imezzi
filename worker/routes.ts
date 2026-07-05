import { arrivalsBatchHandler } from './handlers/arrivals-batch.ts';
import { arrivalsHandler } from './handlers/arrivals.ts';
import { geometryHandler } from './handlers/geometry.ts';
import { staticDataHandler } from './handlers/static-data.ts';
import { trainsHandler } from './handlers/trains.ts';

export interface Route {
  readonly pattern: RegExp;
  readonly handler: (match: readonly string[]) => Promise<Response>;
}

/** API route table (live-map design §1). First match wins. */
export const routes: readonly Route[] = [
  { pattern: /^\/api\/arrivals\/(\d{1,6})$/, handler: arrivalsHandler },
  {
    pattern: /^\/api\/arrivals-batch\/(\d{1,6}(?:,\d{1,6}){0,39})$/,
    handler: arrivalsBatchHandler,
  },
  { pattern: /^\/api\/(stops|lines|line-stops)$/, handler: staticDataHandler },
  {
    pattern: /^\/api\/geometry\/([A-Za-z0-9-]{1,8})\/([12])$/,
    handler: geometryHandler,
  },
  {
    pattern: /^\/api\/trains\/(partenze|arrivi)\/(S\d{5})$/,
    handler: trainsHandler,
  },
];
