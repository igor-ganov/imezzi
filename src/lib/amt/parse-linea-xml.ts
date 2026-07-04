import type { LineGeometry } from './types.ts';

const MARKER =
  /<marker lat\s*=\s*"([\d.]+)" lng\s*=\s*"([\d.]+)"[^>]*label="(\d+) - ([^"]*)"/g;
const POINT = /<point lng\s*=\s*"([\d.-]+)" lat\s*=\s*"([\d.-]+)"/g;

const toStop = (match: RegExpMatchArray) => ({
  id: match[3] ?? '',
  name: match[4] ?? '',
  lat: Number(match[1] ?? '0'),
  lon: Number(match[2] ?? '0'),
});

const toPoint = (match: RegExpMatchArray): readonly [number, number] => [
  Number(match[1] ?? '0'),
  Number(match[2] ?? '0'),
];

/** Parse AMT readxml_linea.php into stops + route path (lon/lat). */
export const parseLineaXml = (xml: string): LineGeometry => ({
  stops: Array.from(xml.matchAll(MARKER)).map(toStop),
  path: Array.from(xml.matchAll(POINT)).map(toPoint),
});
