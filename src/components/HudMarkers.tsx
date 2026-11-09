import type { ReactNode } from "react";

/** 16px reticle — punctuation before a title. */
export function Reticle() {
  return <span aria-hidden="true" className="reticle inline-block" />;
}

/** 72px X target — in a corner of the composition. */
export function Target() {
  return <span aria-hidden="true" className="target inline-block" />;
}

/** Warning diamond with a short text over two lines. */
export function WarningMark({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold leading-none tracking-wider uppercase text-foreground">
      <i
        aria-hidden="true"
        className="inline-grid size-4.5 rotate-45 place-items-center border-2 border-foreground text-xs not-italic"
      >
        <b className="-rotate-45">!</b>
      </i>
      <span>{children}</span>
    </span>
  );
}

/** Vertical rail — texture only, never information. */
export function Rail({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex flex-col items-center gap-3 font-sans text-sm font-bold tracking-widest text-foreground [writing-mode:vertical-rl]"
    >
      {children}
      <span className="h-24 w-1.5 bg-foreground" />
    </span>
  );
}
