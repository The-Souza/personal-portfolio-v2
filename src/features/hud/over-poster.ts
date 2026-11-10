"use client";

import { useEffect, useState } from "react";

/** Whether the finished Contact poster sits under a point of the screen (a y in viewport px). */
export function coversPoint(poster: { top: number; bottom: number }, y: number, clipped: boolean) {
  return !clipped && poster.top <= y && poster.bottom >= y;
}

/** Whether any of the Alert surfaces (the Contact poster, the footer) sits under a point. */
export function anyCovers(surfaces: { top: number; bottom: number; clipped: boolean }[], y: number) {
  return surfaces.some((surface) => coversPoint(surface, y, surface.clipped));
}

/**
 * Which parts of the side HUD sit over an Alert surface (the Contact poster or the footer): the
 * act marks at mid-screen and the reading at the bottom. Fixed outside them, they would keep the
 * page theme's colors on yellow.
 */
export function useOverPoster() {
  const [over, setOver] = useState({ marks: false, reading: false });

  useEffect(() => {
    const poster = document.querySelector<HTMLElement>("[data-contact-poster]");
    const footer = document.querySelector<HTMLElement>("footer.alert");
    let frame = 0;
    const check = () => {
      frame = 0;
      const surfaces = [];
      // The poster counts only once the blade stops cutting it.
      if (poster) surfaces.push({ ...poster.getBoundingClientRect().toJSON(), clipped: poster.style.clipPath !== "" });
      if (footer) surfaces.push({ ...footer.getBoundingClientRect().toJSON(), clipped: false });
      const marks = anyCovers(surfaces, window.innerHeight / 2);
      const reading = anyCovers(surfaces, window.innerHeight - 16);
      setOver((current) => (current.marks === marks && current.reading === reading ? current : { marks, reading }));
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
  }, []);

  return over;
}
