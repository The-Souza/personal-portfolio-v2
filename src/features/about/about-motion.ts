/**
 * True when the element's top is already above its trigger line (e.g. 82% of the viewport).
 * Those elements are left as rendered: hiding them to animate would flash the server text.
 */
export function hasEntered(top: number, viewportHeight: number, startRatio: number) {
  return top < viewportHeight * startRatio;
}

/** Whole numbers count up from 0; anything else (like `v1.5.1`) scrambles instead. */
export function parseCount(value: string) {
  return /^\d+$/.test(value) ? Number(value) : null;
}

/** The rail marker follows the thread and turns 450° over the whole column (brief, act 02). */
export function markerFrame(progress: number, length: number) {
  return { y: progress * length, rotation: progress * 450 };
}
