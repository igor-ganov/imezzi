import type { Arrival } from './types.ts';
import { tagValue } from './tag-value.ts';

const toArrival = (block: string): Arrival => ({
  line: tagValue(block, 'Linea'),
  destination: tagValue(block, 'Destinazione'),
  theoretical: tagValue(block, 'Teorica') === 'true',
  arrivalTime: tagValue(block, 'OraArrivo'),
  countdown: tagValue(block, 'PrevisioneArrivo'),
  vehicle: tagValue(block, 'NumeroSociale'),
  full: tagValue(block, 'AutobusPieno') === 'true',
});

/** Parse AMT passaggi_xml.php `<ArrayOfPrevisione>` into arrivals. */
export const parsePrevisioni = (xml: string): readonly Arrival[] =>
  Array.from(xml.matchAll(/<Previsione>([\s\S]*?)<\/Previsione>/g))
    .map((match) => match[1] ?? '')
    .map(toArrival);
