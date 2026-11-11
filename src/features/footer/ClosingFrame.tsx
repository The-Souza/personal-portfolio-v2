"use client";

import { type ReactNode, useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/motion/gsap";

const CLOSED_CUT = "0.75rem";

/**
 * Brief, act 05: when the scroll reaches the end of the page, the footer's HudFrame closes its
 * cuts from 16 to 12px (the frame transitions `--frame-cut`), and opens them again going back.
 */
export function ClosingFrame({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const frame = root?.querySelector<HTMLElement>("[data-hud-frame]");
      const footer = root?.closest("footer");
      if (!frame || !footer) return;
      const open = frame.style.getPropertyValue("--frame-cut");
      ScrollTrigger.create({
        trigger: footer,
        start: "bottom bottom+=2",
        onEnter: () => frame.style.setProperty("--frame-cut", CLOSED_CUT),
        onLeaveBack: () => frame.style.setProperty("--frame-cut", open),
      });
      return () => frame.style.setProperty("--frame-cut", open);
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
