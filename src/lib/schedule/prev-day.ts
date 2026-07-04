/** Previous YYYYMMDD (UTC arithmetic — dates are plain labels here). */
export const prevDay = (day: string): string => {
  const date = new Date(
    Date.UTC(
      Number(day.slice(0, 4)),
      Number(day.slice(4, 6)) - 1,
      Number(day.slice(6, 8)) - 1,
    ),
  );
  return date.toISOString().slice(0, 10).replaceAll('-', '');
};
