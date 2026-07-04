const NEXT: Readonly<Record<string, 'light' | 'dark' | 'system'>> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

/** Theme preference cycle: light → dark → system (site AC-2.2). */
export const nextPref = (pref: string): 'light' | 'dark' | 'system' =>
  NEXT[pref] ?? 'light';
