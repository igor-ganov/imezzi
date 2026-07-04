type Row = Readonly<Record<string, string>>;

/** calendar_dates rows → service_id → active YYYYMMDD dates. */
export const serviceDatesOf = (
  calendarDates: readonly Row[],
): ReadonlyMap<string, readonly string[]> => {
  const services = new Map<string, string[]>();
  calendarDates
    .filter((row) => row['exception_type'] === '1')
    .forEach((row) => {
      const dates = services.get(row['service_id'] ?? '') ?? [];
      dates.push(row['date'] ?? '');
      services.set(row['service_id'] ?? '', dates);
    });
  return services;
};
