const normalize = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

/** Query match on badge label or description (live-map AC-2.3). */
export const filterLines = <T extends { label: string; description: string }>(
  lines: readonly T[],
  query: string,
): readonly T[] => {
  const needle = normalize(query.trim());
  return lines.filter(
    (line) =>
      needle === '' ||
      normalize(line.label).includes(needle) ||
      normalize(line.description).includes(needle),
  );
};
