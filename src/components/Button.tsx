import { cn } from "@/lib/utils";
import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
} from "react";

export interface ButtonProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  children: ReactNode;
  /** Com href vira <a> (ou o componente de `as`, ex.: next/link). */
  href?: string;
  /** "outline" (padrão): corpo `card`, contorno `primary`. "solid": preenchido em `primary`, flood em `live`. */
  variant?: "outline" | "solid";
  /** Mostra a seta → no fim. Padrão true. */
  arrow?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Componente de link, ex.: `Link` do next/link. */
  as?: ElementType;
}

/** CTA chanfrado com flood que entra da esquerda no hover. */
export function Button({
  children,
  href,
  variant = "outline",
  arrow = true,
  disabled,
  type = "button",
  as,
  className,
  ...rest
}: ButtonProps) {
  const Comp: ElementType = as ?? (href ? "a" : "button");
  const isButton = Comp === "button";
  const solid = variant === "solid";
  return (
    <Comp
      {...rest}
      className={cn(
        "group inline-flex text-label uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
      href={isButton ? undefined : href}
      type={isButton ? type : undefined}
      disabled={isButton ? disabled : undefined}
      aria-disabled={!isButton && disabled ? true : undefined}
    >
      <span className="chamfer block bg-primary p-px">
        <span
          className={cn(
            "chamfer relative flex h-12.5 items-center gap-3 overflow-hidden px-6 text-base",
            solid
              ? "bg-primary text-primary-foreground in-[.alert]:group-hover:text-foreground"
              : "bg-card text-primary-accessible group-hover:text-primary-foreground",
            "transition-colors duration-250 ease-plate",
          )}
          style={{ "--cut": "11.6px" } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 origin-left scale-x-0 transition-transform duration-250 ease-plate group-hover:scale-x-100",
              solid ? "bg-live in-[.alert]:bg-secondary" : "bg-primary",
            )}
          />
          <span className="relative">{children}</span>
          {arrow && (
            <span
              aria-hidden="true"
              className="relative transition-transform duration-150 ease-entrance group-hover:translate-x-1"
            >
              →
            </span>
          )}
        </span>
      </span>
    </Comp>
  );
}
