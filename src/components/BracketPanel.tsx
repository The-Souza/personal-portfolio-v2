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
}

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
}: BracketPanelProps) {
  return (
    <Comp
      className={cn(
        "brackets relative px-5.5 pt-4 pb-4.75 text-foreground",
        tone === "focus" && "[--bc:var(--foreground)]",
        filled && "bg-card",
        className,
      )}
    >
      {eyebrow && (
        <p className="font-mono text-eyebrow uppercase text-primary-accessible">
          {eyebrow}
        </p>
      )}
      {(title || details) && (
        <dl className="mt-4 grid gap-1.5 text-sm leading-[1.1] uppercase">
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
