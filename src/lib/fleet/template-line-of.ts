/**
 * The template lookup key for a SIMON line label. AMT marks barrata
 * (shortened/variant) runs with a trailing slash — `604/` — but GTFS
 * carries templates only under the base line `604`. Tracking uses
 * the base geometry (closest approximation); the UI keeps the
 * original label.
 */
export const templateLineOf = (label: string): string =>
  label.replace(/[/.]+$/, '');
