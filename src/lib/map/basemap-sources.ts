/** Keyless basemap sources: OpenFreeMap vectors + Mapzen terrain. */
export const basemapSources = {
  openmaptiles: {
    type: 'vector',
    url: 'https://tiles.openfreemap.org/planet',
    attribution: '© OpenMapTiles © OpenStreetMap contributors',
  },
  dem: {
    type: 'raster-dem',
    tiles: [
      'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    ],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 14,
    attribution: '© Mapzen, USGS',
  },
};
