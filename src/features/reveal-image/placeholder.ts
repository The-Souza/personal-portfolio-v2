/** `#rrggbb` (how the theme tokens are stored) with an alpha, for canvas gradients. */
export function withAlpha(hex: string, alpha: number) {
  const value = hex.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Small deterministic random, so each card keeps the same placeholder on every render. */
export function seededRandom(seed: number) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Stand-in screenshot from the prototype (a mock dashboard), drawn with the theme tokens
 * read from `tokenSource`. Used until the real prints arrive in public/images/.
 */
export function drawPlaceholder(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed: number,
  label: string,
  tokenSource: Element,
) {
  const token = (name: string) => getComputedStyle(tokenSource).getPropertyValue(name).trim();
  const raised = token("--secondary");
  const panel = token("--card");
  const accent = token("--primary");
  const ink = token("--foreground");
  const random = seededRandom(seed);

  const base = context.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, raised);
  base.addColorStop(1, panel);
  context.fillStyle = base;
  context.fillRect(0, 0, width, height);

  const glowX = width * (0.35 + random() * 0.45);
  const glowY = height * (0.25 + random() * 0.4);
  const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.6);
  glow.addColorStop(0, withAlpha(accent, 0.55));
  glow.addColorStop(1, withAlpha(accent, 0));
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.fillStyle = withAlpha(ink, 0.12);
  context.fillRect(width * 0.06, height * 0.07, width * 0.88, height * 0.06);
  context.fillRect(width * 0.06, height * 0.17, width * 0.18, height * 0.7);
  for (let i = 0; i < 3; i++) {
    context.fillStyle = i === 1 ? withAlpha(accent, 0.4) : withAlpha(ink, 0.09);
    context.fillRect(width * (0.28 + i * 0.23), height * 0.17, width * 0.2, height * 0.22);
  }
  for (let i = 0; i < 10; i++) {
    const bar = height * (0.08 + random() * 0.3);
    context.fillStyle = withAlpha(accent, 0.5);
    context.fillRect(width * (0.3 + i * 0.064), height * 0.87 - bar, width * 0.04, bar);
  }

  context.fillStyle = withAlpha(ink, 0.6);
  context.font = `500 ${Math.max(10, Math.round(width * 0.024))}px ${token("--font-jetbrains-mono") || "monospace"}`;
  context.fillText(label.toUpperCase(), width * 0.06, height * 0.95);
}
