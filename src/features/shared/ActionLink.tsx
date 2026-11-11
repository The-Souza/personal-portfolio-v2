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
  // The external arrow is drawn in the mono face, which has its own "↗": Space Grotesk (the label
  // face) lacks it, and iOS fell back to a system glyph twice the size, unlike the mono links in
  // Contact. U+FE0E keeps it a text glyph wherever a font would offer the emoji form.
  const arrow = external ? "↗︎" : "→";

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
        <span className={cn(external && "font-mono")}>{arrow}</span>
        {!bare && " ]"}
      </span>
    </a>
  );
}
