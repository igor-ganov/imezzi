export interface Signal<T> {
  readonly get: () => T;
  readonly set: (value: T) => void;
  readonly subscribe: (listener: (value: T) => void) => () => void;
}

/** Minimal observable value — the app's only state primitive. */
export const signal = <T>(initial: T): Signal<T> => {
  const state = { value: initial };
  const listeners = new Set<(value: T) => void>();
  return {
    get: () => state.value,
    set: (value) => {
      state.value = value;
      listeners.forEach((listener) => listener(value));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
