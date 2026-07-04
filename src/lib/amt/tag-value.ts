/** First text content of `<tag>…</tag>` inside an XML fragment. */
export const tagValue = (fragment: string, tag: string): string =>
  new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(fragment)?.[1]?.trim() ?? '';
