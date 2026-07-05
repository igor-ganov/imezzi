type StyleLayer = Record<string, unknown> & { readonly id: string };

const CORE_SOURCE_LAYERS = new Set([
  'water',
  'waterway',
  'place',
  'boundary',
  'transportation_name',
]);

/**
 * The lite tier for software-GL clients: same colour language, a
 * fraction of the layers. Full styles carry 50–130 layers (casings,
 * bridges, tunnels, POIs, landuse) whose shader/layout cost stalls
 * software rasterizers for tens of seconds; the core keeps the map
 * readable — background, water, roads, boundaries, labels.
 */
export const liteLayers = (
  layers: readonly StyleLayer[],
): readonly StyleLayer[] =>
  layers.filter(
    (layer) =>
      layer['type'] === 'background' ||
      CORE_SOURCE_LAYERS.has(`${layer['source-layer']}`) ||
      (layer['source-layer'] === 'transportation' &&
        !/casing|bridge|tunnel/.test(layer.id)),
  );
