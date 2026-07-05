import type { StyleSpecification } from 'maplibre-gl';
import brightStyle from './styles/bright.json';
import darkStyle from './styles/dark.json';
import { applyOverlays } from './apply-overlays.ts';
import { basemapSources } from './basemap-sources.ts';
import { liteLayers } from './lite-layers.ts';

type MutableLayer = Record<string, unknown> & {
  readonly id: string;
  layout?: Record<string, unknown>;
};

const STYLES: Readonly<Record<string, unknown>> = {
  light: brightStyle,
  dark: darkStyle,
};

/**
 * The events-site basemap look, ported: OSM Bright (light) / retuned
 * Dark Matter (dark) with hillshade relief and a major-road
 * highlight on dark. Sources swap to OpenFreeMap's OpenMapTiles
 * vector tiles (same schema, no key); glyphs and sprites self-host.
 * Software-GL clients get the lite layer tier. The `as` casts sit on
 * the JSON boundary, as in the reference implementation.
 */
export const buildStyle = (
  theme: 'light' | 'dark',
  hardwareGl: boolean,
): StyleSpecification => {
  const dark = theme === 'dark';
  const style = structuredClone(
    STYLES[theme] ?? brightStyle,
  ) as StyleSpecification;
  style.layers =
    {
      true: style.layers,
      false: liteLayers(
        style.layers as unknown as readonly MutableLayer[],
      ) as unknown as StyleSpecification['layers'],
    }[`${hardwareGl}`] ?? style.layers;
  style.sources = structuredClone(
    basemapSources,
  ) as StyleSpecification['sources'];
  style.glyphs = `${location.origin}/font/{fontstack}/{range}.pbf`;
  // POI sprites as in the reference map: light uses OSM Bright's
  // Maki set (poi-color), dark a white-recoloured copy (poi-dark) so
  // the same icons stay legible — the civics layer draws shop_11 /
  // marker_11 from here too.
  style.sprite = `${location.origin}/sprite/${
    { true: 'poi-dark', false: 'poi-color' }[`${dark}`]
  }/sprite`;
  applyOverlays(style.layers as unknown as MutableLayer[], dark, hardwareGl);
  return style;
};
