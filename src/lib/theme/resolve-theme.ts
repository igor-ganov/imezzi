const FIXED: Readonly<Record<string, 'light' | 'dark'>> = {
  light: 'light',
  dark: 'dark',
};

const BY_SYSTEM: Readonly<Record<string, 'light' | 'dark'>> = {
  true: 'dark',
  false: 'light',
};

/** Effective theme for a stored preference + system setting. */
export const resolveTheme = (
  pref: string,
  systemDark: boolean,
): 'light' | 'dark' => FIXED[pref] ?? BY_SYSTEM[`${systemDark}`] ?? 'light';
