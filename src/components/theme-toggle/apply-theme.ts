import { appState } from '../../lib/store/app-state.ts';
import { resolveTheme } from '../../lib/theme/resolve-theme.ts';

/**
 * Persist and apply a theme preference with the circular-reveal view
 * transition anchored at the interaction point (site AC-2.2).
 */
export const applyTheme = (
  pref: 'light' | 'dark' | 'system',
  point: { readonly x: number; readonly y: number },
): void => {
  const root = document.documentElement;
  const theme = resolveTheme(
    pref,
    matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const radius = Math.hypot(
    Math.max(point.x, innerWidth - point.x),
    Math.max(point.y, innerHeight - point.y),
  );
  root.style.setProperty('--theme-x', `${point.x}px`);
  root.style.setProperty('--theme-y', `${point.y}px`);
  root.style.setProperty('--theme-r', `${radius}px`);
  localStorage.setItem('theme-pref', pref);
  const apply = () => {
    root.dataset['theme'] = theme;
    root.dataset['themePref'] = pref;
    appState.theme.set(theme);
  };
  const start = document.startViewTransition?.bind(document);
  (start ?? ((fn: () => void) => fn()))(apply);
};
