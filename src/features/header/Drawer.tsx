"use client";

import { BracketPanel } from "@/components/BracketPanel";
import { ACT_IDS } from "@/content/acts";
import { SITE } from "@/content/site";
import { LanguageSwitcher } from "@/features/header/LanguageSwitcher";
import { ThemeToggle } from "@/features/header/ThemeToggle";
import { pad2 } from "@/lib/format";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";

interface DrawerProps {
  open: boolean;
  activeIndex: number;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: (returnFocus?: boolean) => void;
  /** Closes and scrolls to the section; the href still works without JS. */
  onNavigate: (hash: string) => void;
}

export function Drawer({ open, activeIndex, panelRef, onClose, onNavigate }: DrawerProps) {
  const t = useTranslations("header");

  return (
    <div id="site-drawer" hidden={!open} className="fixed inset-0 z-75">
      {/* Esc and the close button cover keyboard users; this is the pointer shortcut. */}
      <div
        data-testid="drawer-overlay"
        aria-hidden="true"
        onClick={() => onClose()}
        className="dark absolute inset-0 bg-background/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        data-lenis-prevent
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="absolute inset-y-0 right-0 flex w-[min(26.25rem,85vw)] flex-col gap-7 overflow-y-auto border-l border-field-border bg-card px-6 pt-4 pb-6 text-foreground"
      >
        <div className="flex min-h-10 items-center justify-between">
          <p
            id="drawer-title"
            className="font-mono text-eyebrow text-primary-accessible uppercase"
          >
            {t("menuEyebrow")}
          </p>
          <button
            type="button"
            onClick={() => onClose()}
            className="border border-field-border px-3 py-2.25 font-mono text-xs leading-none tracking-widest uppercase transition-colors duration-150 ease-entrance hover:border-primary hover:text-primary-accessible"
          >
            <span aria-hidden="true">[ </span>
            {t("menuClose")}
            <span aria-hidden="true"> ]</span>
          </button>
        </div>

        <nav aria-label={t("sectionsAria")}>
          <ol className="border-t border-border">
            {ACT_IDS.map((id, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={i === activeIndex ? "true" : "false"}
                  onClick={(event) => {
                    event.preventDefault();
                    onNavigate(`#${id}`);
                  }}
                  className="group flex items-baseline gap-4 border-b border-border py-4"
                >
                  <span className="font-mono text-xs tracking-widest text-muted-foreground group-aria-current:text-primary-accessible">
                    {pad2(i + 1)}
                  </span>
                  <span className="font-heading text-[clamp(1.75rem,8vw,2.25rem)] leading-none font-bold uppercase transition-colors duration-150 ease-entrance group-hover:text-primary-accessible group-aria-current:text-primary-accessible">
                    {t(`menuItems.${id}`)}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <BracketPanel className="mt-auto font-mono text-xs leading-relaxed tracking-wider uppercase">
          <p>{t("status")}</p>
          <p className="normal-case">{SITE.email}</p>
        </BracketPanel>
      </div>
    </div>
  );
}
