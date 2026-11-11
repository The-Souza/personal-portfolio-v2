export interface SectionBox {
  top: number;
  height: number;
}

export interface ActiveSection {
  index: number;
  /** 0 to 100, measured by the line across the middle of the viewport. */
  progress: number;
}

/**
 * The active section is the last one whose top has crossed the middle of the viewport.
 * `scrollRemaining` is how far the page can still scroll: the last act's middle line never
 * reaches its end (only the footer follows), so it fills by what's left to scroll instead, and
 * reads 100 at the bottom of the page.
 */
export function resolveActiveSection(boxes: SectionBox[], viewportHeight: number, scrollRemaining = Infinity): ActiveSection {
  const line = viewportHeight / 2;
  let index = 0;
  boxes.forEach((box, i) => {
    if (box.top <= line) index = i;
  });

  const box = boxes[index];
  if (!box) return { index: 0, progress: 0 };

  const passed = line - box.top;
  const isLast = index === boxes.length - 1;
  const span = isLast ? Math.min(box.height, passed + scrollRemaining) : box.height;
  const ratio = span > 0 ? passed / span : 1;
  return { index, progress: Math.round(Math.min(1, Math.max(0, ratio)) * 100) };
}
