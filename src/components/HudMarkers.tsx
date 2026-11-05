import type { ReactNode } from "react";

/** Retícula de 16px — pontuação antes de um título. */
export function Reticle() {
  return <span aria-hidden="true" className="reticle inline-block" />;
}

/** Alvo em X de 72px — num canto da composição. */
export function Target() {
  return <span aria-hidden="true" className="target inline-block" />;
}

/** Losango de aviso com texto curto em duas linhas. */
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

/** Trilho vertical — só textura, nunca informação. */
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
