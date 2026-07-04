const BASE =
  'https://mappe.comune.genova.it/geoserver/ows?service=WFS&version=2.0.0' +
  '&request=GetFeature&typeNames=MEDIATORE:V_CIVICI_DBT_ANGOLO_GEOSERVER' +
  '&outputFormat=application/json&srsName=EPSG:4326';

/** WFS GetFeature URL with either a CQL filter or a lon/lat bbox. */
export const wfsUrl = (params: {
  readonly cql?: string;
  readonly bbox?: readonly [number, number, number, number];
  readonly count: number;
}): string =>
  [
    BASE,
    `&count=${params.count}`,
    ...[params.cql ?? ''].filter((cql) => cql !== '').map(
      (cql) => `&CQL_FILTER=${encodeURIComponent(cql)}`,
    ),
    ...[params.bbox]
      .filter((bbox): bbox is readonly [number, number, number, number] =>
        bbox !== undefined,
      )
      .map((bbox) => `&bbox=${bbox.join(',')},EPSG:4326`),
  ].join('');
