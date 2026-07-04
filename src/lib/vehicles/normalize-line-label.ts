/** AMT `Linea` codes are zero-padded (`009`); UI labels are not. */
export const normalizeLineLabel = (label: string): string =>
  label.trim().replace(/^0+(?=.)/, '').toUpperCase();
