import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HudFrameProps {
  children: ReactNode;
  /** Size of the cut on the top-left and bottom-right corners, in px. Default 16. */
  cut?: number;
  className?: string;
}

/**
 * Frame with two corners cut at 45°. The cut lives in `--frame-cut` (registered with
 * `@property` in globals.css), so changing it animates both corners over 700ms.
 */
export function HudFrame({ children, cut = 16, className }: HudFrameProps) {
  return (
    <div
      data-hud-frame
      className={cn("relative isolate px-4 py-4 phone:px-6 text-foreground transition-[--frame-cut] duration-700 ease-plate", className)}
      style={{ "--frame-cut": `${cut}px` } as CSSProperties}
    >
      <span aria-hidden="true" className="chamfer-2 absolute inset-0 -z-10 bg-field-border [--cut:var(--frame-cut)]" />
      <span aria-hidden="true" className="chamfer-2 absolute inset-px -z-10 bg-background [--cut:calc(var(--frame-cut)-0.025rem)]" />
      {children}
    </div>
  );
}

/**
 * The frame's inner row: the status on the left, the mark on the right. It breaks by content,
 * not by a breakpoint: when the status lines don't fit whole beside the mark, the mark drops
 * below them (on a 320px phone), instead of squeezing the status into lines with orphans.
 */
export function HudFrameRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-3 phone:gap-x-6">{children}</div>;
}

/** Code/mark in the display face, e.g. "GV-026". Never wraps, not even at the hyphen. */
export function HudMark({ children }: { children: ReactNode }) {
  return <span className="ml-auto font-heading text-[clamp(1.5rem,3.25vw+0.75rem,1.875rem)] font-bold leading-none tracking-wide whitespace-nowrap uppercase">{children}</span>;
}
