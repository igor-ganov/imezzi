const encodeValue = (value: number): string => {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let out = '';
  while (v >= 0x20) {
    out += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  return out + String.fromCharCode(v + 63);
};

/** Google polyline encoder for plan fixtures ([lon, lat] input). */
export const encodePolyline = (
  coords: readonly (readonly [number, number])[],
  precision: number,
): string => {
  const factor = 10 ** precision;
  let lastLat = 0;
  let lastLon = 0;
  let out = '';
  for (const [lon, lat] of coords) {
    const iLat = Math.round(lat * factor);
    const iLon = Math.round(lon * factor);
    out += encodeValue(iLat - lastLat) + encodeValue(iLon - lastLon);
    lastLat = iLat;
    lastLon = iLon;
  }
  return out;
};
