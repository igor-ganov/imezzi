/** ISO instant → Rome-local HH:MM for itinerary rows. */
export const formatClock = (iso: string): string =>
  new Intl.DateTimeFormat('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
