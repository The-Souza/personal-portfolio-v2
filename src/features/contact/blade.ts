/**
 * The Contact blade (brief, act 05 · B): the yellow poster enters as a 45° cut that sweeps
 * right to left. `s` is the top of the cut as a fraction of the width; the base trails 55% behind.
 */
export const BLADE = {
  from: 1.6,
  to: -0.12,
  slant: 0.55,
  /** The black edge under the poster: the same cut, this many % to the left. */
  edge: 1.4,
  /** The title enters once the top of the cut passes this point. */
  reveal: 0.5,
} as const;

export function bladeAt(progress: number) {
  const clamped = Math.min(1, Math.max(0, progress));
  return BLADE.from + (BLADE.to - BLADE.from) * clamped;
}

const percent = (value: number) => `${Number(value.toFixed(3))}%`;

export function bladeClip(s: number, shift = 0) {
  const top = s * 100 - shift;
  const base = (s - BLADE.slant) * 100 - shift;
  return `polygon(${percent(top)} 0, 100% 0, 100% 100%, ${percent(base)} 100%)`;
}

/**
 * Once the top of the cut passes the left edge, the poster covers the whole stage, and its clip
 * goes away: the browser antialiases the cut's bottom edge, and that row of pixels would show the
 * black edge beneath as a hairline over the footer (a phone at 3x makes it plain).
 */
export function isBladeDone(s: number) {
  return s <= 0;
}

export function isTitleReady(s: number) {
  return s < BLADE.reveal;
}
