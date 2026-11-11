import type { ElementType } from "react";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  href: string;
  /** Current page: gets aria-current="page". */
  current?: boolean;
}

export interface MastheadProps {
  /** Name in the text logo, e.g. "Guilherme". */
  name: string;
  /** Suffix in `primary-accessible`, e.g. "_dev". */
  suffix?: string;
  homeHref?: string;
  /** 3 to 5 links. */
  links: NavLink[];
  /** Bracketed link on the right: [ Contato → ]. */
  contact?: { label: string; href: string };
  /** Link component, e.g. `Link` from next/link. */
  linkAs?: ElementType;
  className?: string;
}

const link = "text-label uppercase text-foreground transition-colors duration-150 ease-entrance hover:text-primary-accessible aria-[current=page]:text-primary-accessible focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Top bar: text logo, navigation and a [ Contato → ] link. */
export function Masthead({ name, suffix, homeHref = "/", links, contact, linkAs: L = "a", className }: MastheadProps) {
  return (
    <header className={cn("flex items-center justify-between gap-6 border-b border-border p-6", className)}>
      <L className="font-heading text-xl font-bold uppercase tracking-wide text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" href={homeHref}>
        {name}
        {suffix && <span className="text-primary-accessible">{suffix}</span>}
      </L>
      <nav className="flex gap-6 max-phone:hidden" aria-label="Principal">
        {links.map((l) => (
          <L key={l.href} href={l.href} className={link} aria-current={l.current ? "page" : undefined}>
            {l.label}
          </L>
        ))}
      </nav>
      {contact && (
        <L className={cn(link, "font-bold whitespace-nowrap")} href={contact.href}>
          <span aria-hidden="true">[ </span>
          {contact.label}
          <span aria-hidden="true"> → ]</span>
        </L>
      )}
    </header>
  );
}
