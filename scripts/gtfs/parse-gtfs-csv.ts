const FIELD = /(?:"([^"]*)"|([^,]*))(?:,|$)/g;

const parseLine = (line: string, width: number): readonly string[] =>
  Array.from(line.matchAll(FIELD))
    .map((match) => match[1] ?? match[2] ?? '')
    .slice(0, width);

/**
 * Parse a GTFS CSV file into records keyed by its header row.
 * Handles quoted fields (embedded commas), CRLF, trailing blanks.
 */
export const parseGtfsCsv = (
  text: string,
): readonly Record<string, string>[] => {
  const rows = text
    .split('\n')
    .map((row) => row.replace(/\r$/, ''))
    .filter((row) => row !== '');
  const header = parseLine(rows[0] ?? '', Number.MAX_SAFE_INTEGER);
  return rows
    .slice(1)
    .map((row) =>
      Object.fromEntries(
        parseLine(row, header.length).map((cell, i) => [header[i] ?? '', cell]),
      ),
    );
};
