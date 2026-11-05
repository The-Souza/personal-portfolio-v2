export interface SectionBox {
  top: number;
  height: number;
}

export interface ActiveSection {
  index: number;
  /** 0 to 100, measured by the line across the middle of the viewport. */
  progress: number;
}

/** The active section is the last one whose top has crossed the middle of the viewport. */
export function resolveActiveSection(boxes: SectionBox[], viewportHeight: number): ActiveSection {
  const line = viewportHeight / 2;
  let index = 0;
  boxes.forEach((box, i) => {
    if (box.top <= line) index = i;
  });

  const box = boxes[index];
  if (!box) return { index: 0, progress: 0 };

  const ratio = box.height > 0 ? (line - box.top) / box.height : 1;
  return { index, progress: Math.round(Math.min(1, Math.max(0, ratio)) * 100) };
}
