import type { Stop } from '../amt/types.ts';
import type { CivicHit } from '../civic/civic-hit.ts';

/** Unified search result: a civic address or an AMT stop. */
export type SearchHit =
  | { readonly kind: 'civic'; readonly civic: CivicHit }
  | { readonly kind: 'stop'; readonly stop: Stop };
