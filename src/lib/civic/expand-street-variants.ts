const ROMAN: readonly (readonly [RegExp, string])[] = [
  [/\bxxv\b/g, 'venticinque'],
  [/\bxxiv\b/g, 'ventiquattro'],
  [/\bxx\b/g, 'venti'],
  [/\bxii\b/g, 'dodici'],
  [/\bix\b/g, 'nove'],
  [/\biv\b/g, 'quattro'],
  [/\bv\b/g, 'cinque'],
  [/\bii\b/g, 'due'],
];

const strip = (street: string): string =>
  street
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/^(via|corso|piazza|salita|vico|viale|largo|passo|mura)\s+/i, '')
    .trim();

/**
 * Candidate street spellings: the official stradario spells roman
 * numerals out (VIA XX SETTEMBRE → VIA VENTI SETTEMBRE) (AC-2.3).
 */
export const expandStreetVariants = (street: string): readonly string[] => {
  const base = strip(street);
  const spelled = ROMAN.reduce(
    (text, [pattern, word]) => text.replace(pattern, word),
    base,
  );
  return [...new Set([base, spelled])].filter((value) => value !== '');
};
