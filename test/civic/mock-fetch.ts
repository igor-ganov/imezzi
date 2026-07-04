/** Swap globalThis.fetch for a canned-JSON stub, always restoring it. */
export const withMockedFetch = async (
  payloadOf: (url: string) => unknown,
  run: (urls: readonly string[]) => Promise<void>,
): Promise<void> => {
  const urls: string[] = [];
  const original = globalThis.fetch;
  const stub = async (input: unknown): Promise<Response> => {
    urls.push(String(input));
    return new Response(JSON.stringify(payloadOf(String(input))));
  };
  globalThis.fetch = Object.assign(stub, original);
  try {
    await run(urls);
  } finally {
    globalThis.fetch = original;
  }
};
