const FORMAT: Intl.DateTimeFormatOptions = {
  timeZone: 'Europe/Rome',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

const pick = (parts: readonly Intl.DateTimeFormatPart[], type: string) =>
  parts.find((part) => part.type === type)?.value ?? '00';

/** Rome-local service date (YYYYMMDD) and seconds since midnight. */
export const romeClock = (
  date: Date,
): { readonly day: string; readonly seconds: number } => {
  const parts = new Intl.DateTimeFormat('en-US', FORMAT).formatToParts(date);
  const hour = Number(pick(parts, 'hour')) % 24;
  return {
    day: `${pick(parts, 'year')}${pick(parts, 'month')}${pick(parts, 'day')}`,
    seconds:
      hour * 3600 +
      Number(pick(parts, 'minute')) * 60 +
      Number(pick(parts, 'second')),
  };
};
