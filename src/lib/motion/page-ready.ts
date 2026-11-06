/**
 * Signals that the page segment has hydrated. Next hydrates the page apart from the root layout,
 * so the header can run its effects long before the acts build their pins (almost a second in
 * dev). `PageReady`, the last element of the page, marks it: its layout effect runs after every
 * act's in the same commit.
 */
let ready = false;
const waiting = new Set<() => void>();

export function markPageReady() {
  ready = true;
  for (const callback of waiting) callback();
  waiting.clear();
}

/** Calls back once the page is ready (at once if it already is); returns a cancel function. */
export function onPageReady(callback: () => void) {
  if (ready) {
    callback();
    return () => {};
  }
  waiting.add(callback);
  return () => {
    waiting.delete(callback);
  };
}
