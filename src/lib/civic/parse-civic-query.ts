import type { CivicQuery } from './civic-query.ts';

const WITH_NUMBER =
  /^(.*?)[,\s]+(\d+)\s*([a-qs-z]?)\s*(r\.?|rosso)?\s*$/i;

/**
 * Split a free-form Genoa address into street + civic parts,
 * recognising the red suffix in its written forms (AC-2.1).
 */
export const parseCivicQuery = (input: string): CivicQuery => {
  const trimmed = input.trim().replace(/\s+/g, ' ');
  const match = WITH_NUMBER.exec(trimmed);
  const street = (match?.[1] ?? trimmed).trim();
  const number = match?.[2];
  return {
    street,
    number: { true: undefined, false: Number(number) }[
      `${number === undefined}`
    ],
    letter: (match?.[3] ?? '').toUpperCase(),
    red: (match?.[4] ?? '') !== '',
  };
};
