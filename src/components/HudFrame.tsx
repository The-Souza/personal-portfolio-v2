import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface HudFrameProps {
  children: ReactNode;
  /** Tamanho do corte nos cantos superior esquerdo e inferior direito, em px. Padrão 16. */
  cut?: number;
  className?: string;
}

/**
 * Moldura com dois cantos cortados a 45°. O corte fica em `--frame-cut` (registrada com
 * `@property` no globals.css), então mudá-la anima os dois cantos em 700ms.
 */
export function HudFrame({ children, cut = 16, className }: HudFrameProps) {
  return (
    <div
      data-hud-frame
      className={cn("relative isolate px-6 py-4 text-foreground transition-[--frame-cut] duration-700 ease-plate", className)}
      style={{ "--frame-cut": `${cut}px` } as CSSProperties}
    >
      <span aria-hidden="true" className="chamfer-2 absolute inset-0 -z-10 bg-field-border [--cut:var(--frame-cut)]" />
      <span aria-hidden="true" className="chamfer-2 absolute inset-px -z-10 bg-background [--cut:calc(var(--frame-cut)-0.025rem)]" />
      {children}
    </div>
  );
}

/**
 * Linha interna da moldura em duas colunas: o status quebra dentro da sua, a marca fica
 * inteira à direita.
 */
export function HudFrameRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">{children}</div>;
}

/** Código/marca em display, ex.: "GV-026". Nunca quebra, nem no hífen. */
export function HudMark({ children }: { children: ReactNode }) {
  return <span className="justify-self-end font-heading text-3xl font-bold leading-none tracking-wide whitespace-nowrap uppercase">{children}</span>;
}
