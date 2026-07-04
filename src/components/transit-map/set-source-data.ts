import { GeoJSONSource, type Map as MapLibre } from 'maplibre-gl';

/**
 * Push a GeoJSON payload into a named source, if it exists. Before
 * the first style finishes loading MapLibre has no style object and
 * getSource throws — those early ticks are simply skipped.
 */
export const setSourceData = (
  map: MapLibre,
  sourceId: string,
  data: unknown,
): void => {
  try {
    [map.getSource(sourceId)]
      .filter(
        (source): source is GeoJSONSource => source instanceof GeoJSONSource,
      )
      .forEach((source) => {
        const payload: Parameters<GeoJSONSource['setData']>[0] = JSON.parse(
          JSON.stringify(data),
        );
        source.setData(payload);
      });
  } catch {
    return;
  }
};
