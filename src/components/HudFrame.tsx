import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HudFrameProps {
  children: ReactNode;
  /** Tamanho do corte nos cantos superior esquerdo e inferior direito, em px. Padrão 16. */
  cut?: number;
  className?: string;
}

/** Moldura com dois cantos cortados a 45°. */
export function HudFrame({ children, cut = 16, className }: HudFrameProps) {
  return (
    <div className={cn("relative isolate px-6 py-4 text-foreground", className)}>
      <span aria-hidden="true" className="chamfer-2 absolute inset-0 -z-10 bg-field-border" style={{ "--cut": `${cut}px` } as CSSProperties} />
      <span aria-hidden="true" className="chamfer-2 absolute inset-px -z-10 bg-background" style={{ "--cut": `${cut - 0.4}px` } as CSSProperties} />
      {children}
    </div>
  );
}

/** Linha interna da moldura: status à esquerda, marca à direita. */
export function HudFrameRow({ children }: { children: ReactNode }) {
  return <div className="flex items-end justify-between gap-6">{children}</div>;
}

/** Código/marca em display, ex.: "GV-026". */
export function HudMark({ children }: { children: ReactNode }) {
  return <span className="font-heading text-3xl font-bold leading-none tracking-wide uppercase">{children}</span>;
}
