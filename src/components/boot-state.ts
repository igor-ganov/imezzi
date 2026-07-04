import { appState } from '../lib/store/app-state.ts';
import { resolveTheme } from '../lib/theme/resolve-theme.ts';

/**
 * Sync the store with the theme the pre-paint script resolved, and
 * follow system changes while pref = system (site US-2).
 */
export const bootState = (): void => {
  const root = document.documentElement;
  Object.assign(globalThis, { __imezzi: { appState } });
  appState.theme.set(resolveTheme(root.dataset['theme'] ?? 'light', false));
  matchMedia('(prefers-color-scheme: dark)').addEventListener(
    'change',
    (event) => {
      const pref = root.dataset['themePref'] ?? 'system';
      const theme = resolveTheme(pref, event.matches);
      root.dataset['theme'] = theme;
      appState.theme.set(theme);
    },
  );
};
