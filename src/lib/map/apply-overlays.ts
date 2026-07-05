import { styleOverlays } from './style-overlays.ts';

type MutableLayer = Record<string, unknown> & {
  readonly id: string;
  layout?: Record<string, unknown>;
};

/**
 * In-place layer surgery on a cloned style: pin dark-theme fonts to
 * the self-hosted face, insert hillshade (hardware GL only) below
 * the roads and the dark major-road highlight below the labels.
 */
export const applyOverlays = (
  layers: MutableLayer[],
  dark: boolean,
  hardwareGl: boolean,
): void => {
  layers
    .filter((layer) => dark && layer.layout?.['text-font'] !== undefined)
    .forEach((layer) => {
      (layer.layout ?? {})['text-font'] = ['Noto Sans Regular'];
    });
  const roadAt = layers.findIndex(
    (layer) => layer['source-layer'] === 'transportation',
  );
  [styleOverlays.hillshade(dark)]
    .filter(() => hardwareGl)
    .forEach((layer) =>
      layers.splice(Math.max(roadAt, 1), 0, layer as MutableLayer),
    );
  const symbolAt = layers.findIndex((layer) => layer['type'] === 'symbol');
  [styleOverlays.roadHighlight]
    .filter(() => dark)
    .forEach((layer) =>
      layers.splice(
        { true: symbolAt, false: layers.length }[`${symbolAt >= 0}`] ??
          layers.length,
        0,
        layer as MutableLayer,
      ),
    );
};
