/** Tops within this many pixels are one line (subpixel layout, inline-block baselines). */
const SAME_LINE = 2;

/** The line of each word, from the top of each one. */
export function lineIndexes(tops: number[]) {
  let line = 0;
  return tops.map((top, i) => {
    if (i > 0 && Math.abs(top - tops[i - 1]) > SAME_LINE) line++;
    return line;
  });
}

/**
 * The Contact title's lines shift like a glitched print: each one moves a `step` from the line
 * above, to the side drawn in `picks` (below 0.5 right, otherwise left). If that side would leave
 * the room (past the left margin or beyond `room`), it goes the other way; if neither fits, it
 * stays at the nearest edge. `widths` are the lines' widths, `room` the width they can use.
 */
export function lineOffsets(widths: number[], room: number, step: number, picks: number[]) {
  const offsets: number[] = [];
  widths.forEach((width, i) => {
    const max = Math.max(0, room - width);
    if (i === 0) {
      offsets.push(0);
      return;
    }
    const previous = offsets[i - 1];
    const direction = (picks[i] ?? 0) < 0.5 ? 1 : -1;
    const fits = (offset: number) => offset >= 0 && offset <= max;
    const chosen = previous + direction * step;
    const inverted = previous - direction * step;
    if (fits(chosen)) offsets.push(chosen);
    else if (fits(inverted)) offsets.push(inverted);
    else offsets.push(Math.min(max, Math.max(0, chosen)));
  });
  return offsets;
}
