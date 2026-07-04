import type { CivicQuery } from './civic-query.ts';

const escape = (value: string): string => value.replaceAll("'", "''");

/**
 * CQL filter for the Comune WFS civic layer (design §3). Colour is
 * constrained only for explicit red queries; black-vs-red ordering
 * of mixed results happens client-side (AC-2.1).
 */
export const buildCql = (query: CivicQuery, streetVariant: string): string => {
  const parts = [
    `DESVIA ILIKE '%${escape(streetVariant.toUpperCase())}%'`,
    ...[query.number ?? undefined]
      .filter((num): num is number => num !== undefined)
      .map((num) => `NUMERO='${`${num}`.padStart(4, '0')}'`),
    ...[query.letter]
      .filter((letter) => letter !== '')
      .map((letter) => `LETTERA='${escape(letter)}'`),
    ...[query.red].filter(Boolean).map(() => `COLORE='R'`),
  ];
  return parts.join(' AND ');
};
