/** Case/diacritic-insensitive form for user-facing text matching. */
export const normalizeText = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
