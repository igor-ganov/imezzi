/**
 * Branch-free conditional: lookup-map replacement for the banned
 * ternary/if (functional lint rules). Same helper as previous sites.
 */
export const branch =
  (condition: boolean) =>
  <T>(onTrue: () => T, onFalse: () => T): T =>
    ({ true: onTrue, false: onFalse })[`${condition}`]();
