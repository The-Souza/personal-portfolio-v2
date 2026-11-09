"use client";

import { useEffect, useState } from "react";

/** Whether the finished Contact poster sits under a point of the screen (a y in viewport px). */
export function coversPoint(poster: { top: number; bottom: number }, y: number, clipped: boolean) {
  return !clipped && poster.top <= y && poster.bottom >= y;
}

/**
 * Which parts of the side HUD sit over the Alert poster: the act marks at mid-screen and the
 * reading at the bottom. Fixed outside the poster, they would keep the Night colors on yellow.
 */
export function useOverPoster() {
  const [over, setOver] = useState({ marks: false, reading: false });

  useEffect(() => {
    const poster = document.querySelector<HTMLElement>("[data-contact-poster]");
    if (!poster) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const rect = poster.getBoundingClientRect();
      const clipped = poster.style.clipPath !== "";
      const marks = coversPoint(rect, window.innerHeight / 2, clipped);
      const reading = coversPoint(rect, window.innerHeight - 16, clipped);
      setOver((current) => (current.marks === marks && current.reading === reading ? current : { marks, reading }));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    // The blade is scrubbed, so its cut keeps changing for a moment after the scroll stops.
    const blade = new MutationObserver(schedule);
    blade.observe(poster, { attributes: true, attributeFilter: ["style"] });
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
