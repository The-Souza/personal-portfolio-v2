export type Point = [number, number];

const MARGIN = 300;

/** Brief, act 04 · C: P[k] = (M + ceil(k/2)·SX, M + floor(k/2)·SY), a stair going right, down, right… */
export function circuitPoints(count: number, { sx, sy }: { sx: number; sy: number }): Point[] {
  return Array.from({ length: count }, (_, k) => [MARGIN + Math.ceil(k / 2) * sx, MARGIN + Math.floor(k / 2) * sy]);
}

/**
 * Step sizes and the camera's vertical focus (FY). Normal: SX = max(min(0.62·vw, 820),
 * NW + max(160, 0.22·vw)), SY = max(0.7·vh, NH + 200), FY = 0.56·vh. Compact (short screens):
 * SX = NW + max(120, 0.18·vw), SY = NH + 120, FY centered below the 56px header.
 */
export function circuitSpacing(
  viewport: { width: number; height: number },
  node: { width: number; height: number },
  compact: boolean,
) {
  if (compact) {
    return {
      sx: node.width + Math.max(120, viewport.width * 0.18),
      sy: node.height + 120,
      fy: 56 + (viewport.height - 56) / 2,
    };
  }
  return {
    sx: Math.max(Math.min(viewport.width * 0.62, 820), node.width + Math.max(160, viewport.width * 0.22)),
    sy: Math.max(viewport.height * 0.7, node.height + 200),
    fy: viewport.height * 0.56,
  };
}

/** Path length from the first point to each point, for the live line's dash offset. */
export function cumulativeLengths(points: Point[]) {
  const lengths = [0];
  for (let k = 1; k < points.length; k++) {
    const [x0, y0] = points[k - 1];
    const [x1, y1] = points[k];
    lengths.push(lengths[k - 1] + Math.hypot(x1 - x0, y1 - y0));
  }
  return lengths;
}
