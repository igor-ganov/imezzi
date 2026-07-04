/**
 * The single wait-ceiling knob (playwright rules): E2E_MAX_WAIT_MS in
 * CI, strict 10 s locally. Specs never override timeouts themselves.
 */
export const MAX_WAIT = Number(process.env['E2E_MAX_WAIT_MS'] ?? '10000');
