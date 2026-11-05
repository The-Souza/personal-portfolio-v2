import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

export interface BracketPanelProps {
  /** Eyebrow em mono, ex.: "// Projeto atual". */
  eyebrow?: string;
  /** Título em negrito da lista (dt). */
  title?: string;
  /** Linhas abaixo do título (dd), em `muted-foreground`. */
  details?: ReactNode[];
  /** "focus": cantos em `foreground` — o painel que importa na tela. */
  tone?: "default" | "focus";
  /** Fundo `card`, para quando o painel fica sobre imagem/WebGL. */
  filled?: boolean;
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  /** Desenha os cantos como 4 elementos (`data-corner`) em vez de fundo, para animá-los um a um. */
  animatedCorners?: boolean;
}

const CORNERS = [
  { name: "tl", className: "top-0 left-0 border-t border-l" },
  { name: "tr", className: "top-0 right-0 border-t border-r" },
  { name: "bl", className: "bottom-0 left-0 border-b border-l" },
  { name: "br", className: "right-0 bottom-0 border-r border-b" },
];

/** Caixa de conteúdo marcada só por quatro cantos de 10px. */
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
