/** Seconds → compact duration: `7 min`, `1 h 05`. */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const rest = `${minutes % 60}`.padStart(2, '0');
  switch (true) {
    case minutes < 60:
      return `${minutes} min`;
    default:
      return `${hours} h ${rest}`;
  }
};
