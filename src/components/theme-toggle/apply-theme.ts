import { appState } from '../../lib/store/app-state.ts';
import { resolveTheme } from '../../lib/theme/resolve-theme.ts';

/**
 * Monotonic application ticket: a superseded view transition still
 * runs its update callback LATER than the newer one — without the
 * ticket a quick second click got overwritten back by the first
 * click's late apply (the recurring CI race, in three layers deep).
 */
const latest = { ticket: 0 };

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
  latest.ticket += 1;
  const ticket = latest.ticket;
  const state = { applied: false };
  const apply = () => {
    state.applied = true;
    [ticket]
      .filter((value) => value === latest.ticket)
      .forEach(() => {
        root.dataset['theme'] = theme;
        root.dataset['themePref'] = pref;
        appState.theme.set(theme);
      });
  };
  // Respect reduced motion: the reveal is skipped entirely (a11y),
  // which also removes the transition overlay from the click path.
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = { true: undefined, false: document.startViewTransition?.bind(document) }[
    `${reduced}`
  ];
  (start ?? ((fn: () => void) => fn()))(apply);
  // The view transition snapshots the page BEFORE calling apply — on
  // software GL that snapshot can stall indefinitely, leaving the
  // theme unapplied. The reveal is decoration, the state is not:
  // apply directly if the transition has not fired promptly.
  setTimeout(
    () =>
      ({ true: () => undefined, false: apply })[`${state.applied}`](),
    150,
  );
};
