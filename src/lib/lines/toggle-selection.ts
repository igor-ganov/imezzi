import { branch } from '../branch.ts';

/** Immutable toggle of a line key in the selection set. */
export const toggleSelection = (
  selected: ReadonlySet<string>,
  key: string,
): ReadonlySet<string> => {
  const next = new Set(selected);
  branch(next.has(key))(
    () => {
      next.delete(key);
    },
    () => {
      next.add(key);
    },
  );
  return next;
};
