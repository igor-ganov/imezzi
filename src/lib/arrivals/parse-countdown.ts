const MINUTES = /^(\d+)'$/;
const CLOCK = /^(\d{1,2})[.:](\d{2})$/;

const fromClock = (match: RegExpExecArray, nowSeconds: number): number => {
  const target = Number(match[1] ?? '0') * 3600 + Number(match[2] ?? '0') * 60;
  return (target - nowSeconds + 86400) % 86400;
};

/**
 * AMT countdown string → seconds from now. Formats seen live:
 * `18'` (minutes), `05:24` (clock time), anything else = arriving.
 */
export const parseCountdown = (text: string, nowSeconds: number): number => {
  const trimmed = text.trim();
  const minutes = MINUTES.exec(trimmed);
  const clock = CLOCK.exec(trimmed);
  return (
    (minutes && Number(minutes[1] ?? '0') * 60) ??
    (clock && fromClock(clock, nowSeconds)) ??
    0
  );
};
