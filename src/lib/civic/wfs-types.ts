/** Raw WFS GeoJSON shapes from the Comune civic layer. */

export interface WfsCivicProps {
  readonly DESVIA: string;
  readonly TESTO: string;
  readonly COLORE: string | null;
  readonly NOME_MUNICIPIO: string;
  readonly NUMERO: string;
  readonly LETTERA: string | null;
}

export interface WfsCivicFeature {
  readonly geometry: { readonly coordinates: readonly [number, number] };
  readonly properties: WfsCivicProps;
}

export interface WfsCivicResponse {
  readonly features: readonly WfsCivicFeature[];
}
