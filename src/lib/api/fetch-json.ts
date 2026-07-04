/** GET a JSON resource; rejects on network failure or non-2xx. */
export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const ok = response.ok;
  const fail = () => {
    throw new Error(`GET ${url} → ${response.status}`);
  };
  const parse = async (): Promise<T> => {
    const data: T = await response.json();
    return data;
  };
  return { true: parse, false: fail }[`${ok}`]();
};
