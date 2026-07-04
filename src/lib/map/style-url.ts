const STYLES: Readonly<Record<string, string>> = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

/** OpenFreeMap base style per theme (site design §2 — no key, no cap). */
export const styleUrl = (theme: 'light' | 'dark'): string =>
  STYLES[theme] ?? STYLES['light'] ?? '';
