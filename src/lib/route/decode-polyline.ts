const decodeValue = (
  text: string,
  start: number,
): readonly [number, number] => {
  const state = { shift: 0, result: 0, index: start, byte: 0x20 };
  while (state.byte >= 0x20) {
    state.byte = text.charCodeAt(state.index) - 63;
    state.result |= (state.byte & 0x1f) << state.shift;
    state.shift += 5;
    state.index += 1;
  }
  const value =
    { 0: state.result >> 1, 1: ~(state.result >> 1) }[state.result & 1] ?? 0;
  return [value, state.index];
};

/** Decode a Google encoded polyline into [lon, lat] pairs. */
export const decodePolyline = (
  text: string,
  precision: number,
): readonly (readonly [number, number])[] => {
  const factor = 10 ** precision;
  const coords: (readonly [number, number])[] = [];
  const state = { index: 0, lat: 0, lon: 0 };
  while (state.index < text.length) {
    const [dLat, afterLat] = decodeValue(text, state.index);
    const [dLon, afterLon] = decodeValue(text, afterLat);
    state.lat += dLat;
    state.lon += dLon;
    state.index = afterLon;
    coords.push([state.lon / factor, state.lat / factor]);
  }
  return coords;
};
