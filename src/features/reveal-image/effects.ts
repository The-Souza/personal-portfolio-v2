import { drawPlaceholder } from "@/features/reveal-image/placeholder";

const MOSAIC_STEPS = [64, 32, 16, 8, 4, 1];
const DITHER_CELL = 6;
const MAX_DPR = 1.5;

export const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Block size in px for a mosaic reveal: 64 → 32 → 16 → 8 → 4 → 1 as progress goes 0 → 1. */
export function mosaicBlock(progress: number) {
  const step = Math.min(MOSAIC_STEPS.length - 1, Math.floor(Math.max(0, progress) * MOSAIC_STEPS.length));
  return MOSAIC_STEPS[step];
}

/** When a dither cell turns on (0–1): the Bayer 4×4 level plus a little noise. */
export function ditherThreshold(column: number, row: number, random: () => number = Math.random) {
  return (BAYER_4[(row % 4) * 4 + (column % 4)] + random()) / 17;
}

/**
 * Where to draw an image whole and centered in the target, like `object-fit: contain`: the
 * screenshots show in full, with bands of the card's background where the shapes differ.
 */
export function containRect(image: { width: number; height: number }, target: { width: number; height: number }) {
  const scale = Math.min(target.width / image.width, target.height / image.height);
  const dw = Math.round(image.width * scale);
  const dh = Math.round(image.height * scale);
  return { dx: Math.round((target.width - dw) / 2), dy: Math.round((target.height - dh) / 2), dw, dh };
}

export type RevealEffect = "mosaic" | "dither";

export interface RevealController {
  /** 0 = hidden (mosaic starts pixelated and faint), 1 = the full image. */
  set: (progress: number) => void;
  destroy: () => void;
}

/**
 * Draws a reveal effect on demand. The source is the real image next to the canvas (the
 * next/image RevealImage renders), whole like `object-fit: contain`; until it loads, or for a
 * slot without one, the placeholder art. At the end the canvas clears and the image itself
 * shows (`data-shown`), so what stays on screen is the optimized image, not a canvas copy.
 */
export function createReveal(canvas: HTMLCanvasElement, effect: RevealEffect, seed: number, label: string): RevealController {
  const context = canvas.getContext("2d");
  const source = document.createElement("canvas");
  const small = document.createElement("canvas");
  const image = canvas.parentElement?.querySelector<HTMLImageElement>("img[data-reveal-image]") ?? null;
  let width = 0;
  let height = 0;
  let progress = 0;
  let cells: { x: number; y: number; threshold: number }[] = [];

  const paintSource = () => {
    const sourceContext = source.getContext("2d");
    if (!sourceContext) return;
    if (image?.complete && image.naturalWidth) {
      const box = containRect({ width: image.naturalWidth, height: image.naturalHeight }, { width, height });
      sourceContext.clearRect(0, 0, width, height);
      sourceContext.drawImage(image, box.dx, box.dy, box.dw, box.dh);
      return;
    }
    drawPlaceholder(sourceContext, width, height, seed, label, canvas);
  };

  const draw = () => {
    if (!context || !width) return;
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, width, height);
    if (image) {
      if (progress >= 1) image.dataset.shown = "";
      else delete image.dataset.shown;
    }
    if (progress >= 1) {
      // The real image takes over; without one, the canvas keeps the placeholder.
      if (!image) context.drawImage(source, 0, 0);
      return;
    }

    if (effect === "dither") {
      for (const cell of cells) {
        if (cell.threshold < progress) context.drawImage(source, cell.x, cell.y, DITHER_CELL, DITHER_CELL, cell.x, cell.y, DITHER_CELL, DITHER_CELL);
      }
      return;
    }

    const block = mosaicBlock(progress);
    if (block === 1) {
      context.drawImage(source, 0, 0);
      return;
    }
    const columns = Math.ceil(width / block);
    const rows = Math.ceil(height / block);
    small.width = columns;
    small.height = rows;
    small.getContext("2d")?.drawImage(source, 0, 0, columns, rows);
    context.globalAlpha = progress === 0 ? 0.45 : 1;
    context.drawImage(small, 0, 0, columns, rows, 0, 0, columns * block, rows * block);
    context.globalAlpha = 1;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    canvas.width = width;
    canvas.height = height;
    source.width = width;
    source.height = height;
    paintSource();
    cells = [];
    for (let row = 0, y = 0; y < height; row++, y += DITHER_CELL) {
      for (let column = 0, x = 0; x < width; column++, x += DITHER_CELL) cells.push({ x, y, threshold: ditherThreshold(column, row) });
    }
    draw();
  };

  const repaint = () => {
    paintSource();
    draw();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  // Placeholder colors come from the theme tokens, so a theme switch repaints them.
  const themeObserver = new MutationObserver(repaint);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  // The image may load after the reveal is set up (it's lazy): swap the placeholder for it.
  image?.addEventListener("load", repaint);

  return {
    set: (value) => {
      progress = value;
      draw();
    },
    destroy: () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      image?.removeEventListener("load", repaint);
      if (image) delete image.dataset.shown;
    },
  };
}
