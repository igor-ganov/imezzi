/**
 * The CURRENT theme preference, synchronously. localStorage is
 * written before the view transition; the DOM dataset only updates
 * inside it (after a page snapshot — hundreds of ms on software GL),
 * so reading the dataset made a quick second click observe the OLD
 * pref and re-apply the same step (the lost-click CI flake, and a
 * real fast double-click loses the same way).
 */
export const currentPref = (): string =>
  localStorage.getItem('theme-pref') ??
  document.documentElement.dataset['themePref'] ??
  'system';
