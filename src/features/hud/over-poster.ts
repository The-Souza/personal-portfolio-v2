"use client";

import { type RefObject, useEffect, useState } from "react";

/** The cut's left side as [top, base] in % of the poster's width (see `bladeClip`); null: no cut. */
type Clip = [number, number] | null;

interface Surface {
  left: number;
  top: number;
  width: number;
  height: number;
  clip: Clip;
}

interface Box {
  left: number;
  top: number;
  bottom: number;
}

/** Reads the blade's `clip-path`. A shape it doesn't know covers nothing. */
export function parseBladeClip(clipPath: string): Clip {
  if (!clipPath) return null;
  const match = /^polygon\(\s*(-?[\d.]+)%\s+0(?:px)?,.*,\s*(-?[\d.]+)%\s+100%\s*\)$/.exec(clipPath);
  return match ? [Number(match[1]), Number(match[2])] : [100, 100];
}

/**
 * Whether a surface covers a box of the HUD whole. With the blade cut, the yellow starts at the
 * cut's left side, which runs from `top`% at the poster's top to `base`% at its bottom: the box is
 * covered when it starts right of that side at every height it spans.
 */
export function coversBox(surface: Surface, box: Box) {
  if (box.top < surface.top || box.bottom > surface.top + surface.height) return false;
  if (!surface.clip) return true;
  const [top, base] = surface.clip;
  const edgeAt = (y: number) => surface.left + (surface.width * (top + ((base - top) * (y - surface.top)) / surface.height)) / 100;
  return box.left >= Math.max(edgeAt(box.top), edgeAt(box.bottom));
}

export function anyCovers(surfaces: Surface[], box: Box) {
  return surfaces.some((surface) => coversBox(surface, box));
}

const surfaceOf = (element: HTMLElement, clip: Clip): Surface => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height, clip };
};

/**
 * Which parts of the side HUD sit over an Alert surface (the Contact poster, also while its blade
 * sweeps in, or the footer): each act mark (the children of `marksRef`) and the reading. Fixed
 * outside them, they would keep the page theme's colors on yellow. Per mark, not for the whole
 * rail: the blade's diagonal edge crosses the column, and for a stretch of scroll the lower marks
 * sat on yellow in Night ink (1.39:1) while the upper ones were still on black.
 */
export function useOverPoster(marksRef: RefObject<HTMLElement | null>, readingRef: RefObject<HTMLElement | null>) {
  const [over, setOver] = useState<{ marks: boolean[]; reading: boolean }>({ marks: [], reading: false });

  useEffect(() => {
    const poster = document.querySelector<HTMLElement>("[data-contact-poster]");
    const footer = document.querySelector<HTMLElement>("footer.alert");
    let frame = 0;
    const check = () => {
      frame = 0;
      const surfaces: Surface[] = [];
      if (poster) surfaces.push(surfaceOf(poster, parseBladeClip(poster.style.clipPath)));
      if (footer) surfaces.push(surfaceOf(footer, null));
      const covered = (element: Element | null) => !!element && anyCovers(surfaces, element.getBoundingClientRect());
      const marks = [...(marksRef.current?.children ?? [])].map(covered);
      const reading = covered(readingRef.current);
      setOver((current) =>
        current.reading === reading && current.marks.length === marks.length && current.marks.every((mark, i) => mark === marks[i])
          ? current
          : { marks, reading },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    // The blade is scrubbed, so its cut keeps changing for a moment after the scroll stops.
    const blade = new MutationObserver(schedule);
    if (poster) blade.observe(poster, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      blade.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [marksRef, readingRef]);

  return over;
}
