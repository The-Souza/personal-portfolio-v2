import type { TerminalLine } from "@/components/Terminal";

/** How far the loose "0" follows the cursor, as a share of the distance. */
const FOLLOW = 0.14;
const MAX_X = 120;
const MAX_Y = 90;
/** The aim line from the "0" to the cursor fades out closer than this. */
const AIM_HIDE_BELOW = 30;

const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value));

/**
 * The 404's loose piece (brief, section 11): the "0" follows the cursor on a loose spring,
 * `dx`/`dy` being the cursor's distance from its slot. `slot` is the dashed slot's opacity.
 */
export function looseOffset(dx: number, dy: number) {
  const x = clamp(dx * FOLLOW, MAX_X);
  const y = clamp(dy * FOLLOW, MAX_Y);
  const round = (value: number) => Number(value.toFixed(3));
  return {
    x: round(x) + 0,
    y: round(y) + 0,
    rotation: round(x * 0.1) + 0,
    slot: round(Math.min(1, (Math.abs(x) + Math.abs(y)) / 30)),
  };
}

const pad = (value: number) => String(Math.round(value)).padStart(4, "0");

/** The aim's reading next to the cursor: `ALVO · X 1000 Y 0300 · 736PX` (upper case by CSS). */
export function aimReading(label: string, x: number, y: number, distance: number) {
  return `${label} · X ${pad(x)} Y ${pad(y)} · ${Math.round(distance)}px`;
}

export function isAimLineHidden(distance: number) {
  return distance < AIM_HIDE_BELOW;
}

const fill = (text: string | undefined, values: Record<string, string>) =>
  text?.replace(/\{(\w+)\}/g, (marker, key: string) => values[key] ?? marker);

/** A terminal line from the messages with its `{markers}` (path, digest) filled in. */
export function fillLine(line: TerminalLine, values: Record<string, string>): TerminalLine {
  const filled: TerminalLine = { ...line, text: fill(line.text as string, values) };
  if (line.label !== undefined) filled.label = fill(line.label, values);
  if (line.status !== undefined) filled.status = fill(line.status, values);
  return filled;
}
