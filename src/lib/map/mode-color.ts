import { MODE_HUES } from './mode-hues.ts';

const LIGHTNESS: Readonly<Record<string, string>> = {
  light: '38%',
  dark: '62%',
};

/** Concrete paint colour for a transit mode in the given theme. */
export const modeColor = (mode: string, theme: 'light' | 'dark'): string =>
  `hsl(${MODE_HUES[mode] ?? 208} 72% ${LIGHTNESS[theme] ?? '38%'})`;
