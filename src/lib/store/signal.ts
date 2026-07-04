export interface Signal<T> {
  readonly get: () => T;
  readonly set: (value: T) => void;
  readonly subscribe: (listener: (value: T) => void) => () => void;
}

/**
 * Minimal observable value — the app's only state primitive.
 * Setting an identical value (Object.is) does not notify: dependent
 * effects like map style swaps must not re-run for no-op writes.
 */
export const signal = <T>(initial: T): Signal<T> => {
  const state = { value: initial };
  const listeners = new Set<(value: T) => void>();
  return {
    get: () => state.value,
    set: (value) => {
      const changed = !Object.is(state.value, value);
      state.value = value;
      listeners.forEach((listener) => changed && listener(value));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
