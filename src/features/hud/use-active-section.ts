"use client";

import { useEffect, useState } from "react";
import { ACT_IDS } from "@/content/acts";
import { type ActiveSection, resolveActiveSection } from "@/features/hud/active-section";

const INITIAL: ActiveSection = { index: 0, progress: 0 };

export function useActiveSection() {
  const [active, setActive] = useState<ActiveSection>(INITIAL);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const boxes = ACT_IDS.map((id) => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect ? { top: rect.top, height: rect.height } : { top: Infinity, height: 0 };
      });
      const next = resolveActiveSection(boxes, window.innerHeight);
      setActive((prev) => (prev.index === next.index && prev.progress === next.progress ? prev : next));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return active;
}
