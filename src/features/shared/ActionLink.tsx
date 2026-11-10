import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionLinkProps {
  href: string;
  children: ReactNode;
  /** Opens in a new tab and swaps the arrow for ↗. */
  external?: boolean;
  /** Drops the brackets, for links that sit in a row of plain links. */
  bare?: boolean;
  className?: string;
}

/** Action link in brackets with an arrow: [ Contato → ]. Brackets and arrow are hidden from screen readers. */
export function ActionLink({ href, children, external, bare, className }: ActionLinkProps) {
  const arrow = external ? "↗" : "→";

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "tap-area text-label whitespace-nowrap text-primary-accessible uppercase transition-colors duration-150 ease-entrance hover:text-foreground in-[.alert]:hover:text-muted-foreground",
        className,
      )}
    >
      {!bare && <span aria-hidden="true">[ </span>}
      {children}
      <span aria-hidden="true">
        {" "}
        {arrow}
        {!bare && " ]"}
      </span>
    </a>
  );
}
