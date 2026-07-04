const PARTS: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/Rome',
  weekday: 'short',
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZoneName: 'longOffset',
};

const pick = (parts: readonly Intl.DateTimeFormatPart[], type: string) =>
  parts.find((part) => part.type === type)?.value ?? '';

/**
 * ViaggiaTreno wants a JS-toString-like date in Italian local time,
 * e.g. `Sat Jul 04 2026 05:30:00 GMT+0200` (route-planner design §1).
 */
export const romeDateString = (date: Date): string => {
  const parts = new Intl.DateTimeFormat('en-US', PARTS).formatToParts(date);
  const offset = pick(parts, 'timeZoneName').replace(':', '');
  const time = `${pick(parts, 'hour')}:${pick(parts, 'minute')}:${pick(parts, 'second')}`;
  return `${pick(parts, 'weekday')} ${pick(parts, 'month')} ${pick(parts, 'day')} ${pick(parts, 'year')} ${time} ${offset}`;
};
