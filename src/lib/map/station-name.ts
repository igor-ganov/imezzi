import { branch } from '../branch.ts';

/** "/IMP SPEC" (impianto speciale) and "/METRO" are internal tags,
 *  not part of the place name; a lone trailing slash is GTFS noise. */
const TAG = /\s*\/\s*(imp\s*spec|metro)\s*$/i;

const titleWord = (word: string): string =>
  branch(word.length <= 2 && word === word.toUpperCase())(
    () => word,
    () =>
      word
        .toLowerCase()
        .replace(/(^|[^a-zà-ÿ])([a-zà-ÿ])/g, (_, lead, ch) => lead + ch.toUpperCase()),
  );

/**
 * Display name for a GTFS station: drop the internal tag and trailing
 * slash, then title-case while keeping short all-caps tokens (roman
 * numerals like XX, initials like B.) intact.
 */
export const stationName = (raw: string): string =>
  raw
    .replace(TAG, '')
    .replace(/\/\s*$/, '')
    .trim()
    .split(/\s+/)
    .map(titleWord)
    .join(' ');
