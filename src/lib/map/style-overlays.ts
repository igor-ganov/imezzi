/** Basemap overlays ported from the events-site map (relief + roads). */
export const styleOverlays = {
  hillshade: (dark: boolean): Record<string, unknown> => ({
    id: 'hillshade',
    type: 'hillshade',
    source: 'dem',
    paint: {
      'hillshade-exaggeration': { true: 0.14, false: 0.3 }[`${dark}`],
      'hillshade-shadow-color': { true: '#1b1e26', false: '#6b6155' }[
        `${dark}`
      ],
      'hillshade-highlight-color': { true: '#333b47', false: '#ffffff' }[
        `${dark}`
      ],
    },
  }),
  roadHighlight: {
    id: 'road-highlight',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: [
      'in',
      ['get', 'class'],
      ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']],
    ],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#c0c6cf',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        0.6,
        11,
        2,
        15,
        4.6,
      ],
      'line-opacity': 0.9,
    },
  } as Record<string, unknown>,
};
