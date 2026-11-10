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
  /** With href it becomes an <a> (or the `as` component, e.g. next/link). */
  href?: string;
  /** "outline" (default): `card` body, `primary` outline. "solid": filled with `primary`, `live` flood. */
  variant?: "outline" | "solid";
  /** Shows the → arrow at the end. Default true. */
  arrow?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  /** Link component, e.g. `Link` from next/link. */
  as?: ElementType;
  /** Passed on to the link, e.g. `target="_blank"` for external sites. */
  target?: string;
  rel?: string;
}

/** Chamfered CTA with a flood that comes in from the left on hover. */
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
              ? "bg-primary text-primary-foreground in-[.alert]:group-hover:text-foreground in-[.alert]:group-focus-visible:text-foreground"
              : "bg-card text-primary-accessible group-hover:text-primary-foreground group-focus-visible:text-primary-foreground",
            "transition-colors duration-250 ease-plate",
          )}
          style={{ "--cut": "11.6px" } as CSSProperties}
        >
          <span
            aria-hidden="true"
            className={cn(
              // DESIGN.md: hover and keyboard focus get the same flood.
              "absolute inset-0 origin-left scale-x-0 transition-transform duration-250 ease-plate group-hover:scale-x-100 group-focus-visible:scale-x-100",
              solid ? "bg-live in-[.alert]:bg-secondary" : "bg-primary",
            )}
          />
          <span className="relative">{children}</span>
          {arrow && (
            <span
              aria-hidden="true"
              className="relative transition-transform duration-150 ease-entrance group-hover:translate-x-1 group-focus-visible:translate-x-1"
            >
              →
            </span>
          )}
        </span>
      </span>
    </Comp>
  );
}
