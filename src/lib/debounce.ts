/** Trailing-edge debounce for event-driven inputs. */
export const debounce = <A extends readonly unknown[]>(
  ms: number,
  fn: (...args: A) => void,
): ((...args: A) => void) => {
  const state: { timer?: ReturnType<typeof setTimeout> } = {};
  return (...args) => {
    clearTimeout(state.timer);
    state.timer = setTimeout(() => fn(...args), ms);
  };
};
