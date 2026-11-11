import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

export interface BracketPanelProps {
  /** Mono eyebrow, e.g. "// Projeto atual". */
  eyebrow?: string;
  /** Bold title of the list (dt). A node, so it can carry an aria-hidden mark (StatusDot). */
  title?: ReactNode;
  /** Lines below the title (dd), in `muted-foreground`. */
  details?: ReactNode[];
  /** "focus": corners in `foreground` — the panel that matters on the screen. */
  tone?: "default" | "focus";
  /** `card` background, for when the panel sits over an image/WebGL. */
  filled?: boolean;
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  /** Draws the corners as 4 elements (`data-corner`) instead of a background, to animate them one by one. */
  animatedCorners?: boolean;
}

const CORNERS = [
  { name: "tl", className: "top-0 left-0 border-t border-l" },
  { name: "tr", className: "top-0 right-0 border-t border-r" },
  { name: "bl", className: "bottom-0 left-0 border-b border-l" },
  { name: "br", className: "right-0 bottom-0 border-r border-b" },
];

/** Content box marked only by four 10px corners. */
export function BracketPanel({
  eyebrow,
  title,
  details,
  tone = "default",
  filled,
  children,
  as: Comp = "div",
  className,
  animatedCorners,
}: BracketPanelProps) {
  return (
    <Comp
      className={cn(
        !animatedCorners && "brackets",
        "relative px-5.5 pt-4 pb-4.75 text-foreground",
        tone === "focus" && "[--bc:var(--foreground)]",
        filled && "bg-card",
        className,
      )}
    >
      {animatedCorners &&
        CORNERS.map((corner) => (
          <span
            key={corner.name}
            data-corner={corner.name}
            aria-hidden="true"
            className={cn("pointer-events-none absolute size-2.5 border-(--bc,var(--field-border))", corner.className)}
          />
        ))}
      {eyebrow && (
        <p className="font-mono text-eyebrow uppercase text-primary-accessible">
          {eyebrow}
        </p>
      )}
      {(title || details) && (
        <dl className="mt-4 grid gap-1.5 text-sm leading-none uppercase">
          {title && <dt className="font-bold">{title}</dt>}
          {details?.map((d, i) => (
            <dd key={i} className="text-muted-foreground">
              {d}
            </dd>
          ))}
        </dl>
      )}
      {children}
    </Comp>
  );
}
