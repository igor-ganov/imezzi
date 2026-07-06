import { describe, expect, test } from 'bun:test';
import { feedDecision } from '../../src/components/transit-map/fleet-feed/feed-decision.ts';

const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;
const CONNECTING = 0;

Object.assign(globalThis, {
  WebSocket: { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 },
});

describe('feedDecision — the resume/watchdog brain', () => {
  test('hidden tabs never act', () => {
    expect(feedDecision(true, undefined, 999999)).toBe('none');
    expect(feedDecision(true, CLOSED, 999999)).toBe('none');
  });

  test('no socket → connect', () => {
    expect(feedDecision(false, undefined, 0)).toBe('connect');
  });

  test('screen-on with the old socket still CLOSING → recycle', () => {
    // The frozen-app bug: the dying socket "existed", nothing
    // reconnected. CLOSING/CLOSED means recycle, immediately.
    expect(feedDecision(false, CLOSING, 0)).toBe('recycle');
    expect(feedDecision(false, CLOSED, 0)).toBe('recycle');
  });

  test('a fresh CONNECTING attempt is left alone', () => {
    // It has its own 4 s handshake guard — recycling it would kill
    // legitimate slow connects in a loop.
    expect(feedDecision(false, CONNECTING, 0)).toBe('none');
  });

  test('an OPEN socket with recent data → none', () => {
    expect(feedDecision(false, OPEN, 10000)).toBe('none');
  });

  test('an OPEN socket starved of data → recycle (half-dead link)', () => {
    expect(feedDecision(false, OPEN, 45000)).toBe('recycle');
  });
});
