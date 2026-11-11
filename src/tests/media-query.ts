import { vi } from "vitest";

type Listener = () => void;

/**
 * Replaces matchMedia with one driven by `match(query)`, so a test can change the screen
 * or the motion preference and fire the change listeners.
 */
export function mockMediaQueries(match: (query: string) => boolean) {
  const listeners = new Map<string, Set<Listener>>();
  let matcher = match;

  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matcher(query);
    },
    media: query,
    addEventListener: (_type: string, listener: Listener) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)?.add(listener);
    },
    removeEventListener: (_type: string, listener: Listener) => listeners.get(query)?.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));

  return {
    change(next: (query: string) => boolean) {
      matcher = next;
      for (const set of listeners.values()) for (const listener of set) listener();
    },
  };
}
