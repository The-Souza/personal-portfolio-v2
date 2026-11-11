"use client";

import { BracketPanel } from "@/components/BracketPanel";
import { StatusDot } from "@/components/HudMarkers";
import { ACT_IDS } from "@/content/acts";
import { SITE } from "@/content/site";
import { LanguageSwitcher } from "@/features/header/LanguageSwitcher";
import { ThemeToggle } from "@/features/header/ThemeToggle";
import { pad2 } from "@/lib/format";
import { MEDIA } from "@/lib/motion/breakpoints";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { SPRINGS } from "@/lib/motion/spring";
import { scramble } from "@/lib/motion/text";
import { useTranslations } from "next-intl";
import { type RefObject, useRef } from "react";

interface DrawerProps {
  open: boolean;
  /** Still true while the close animation runs. */
  visible: boolean;
  activeIndex: number;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: (returnFocus?: boolean) => void;
  /** Closes and scrolls to the section; the href still works without JS. */
  onNavigate: (hash: string) => void;
  /** Called when the close animation ends, to take the drawer off screen. */
  onHidden: () => void;
}

export function Drawer({ open, visible, activeIndex, panelRef, onClose, onNavigate, onHidden }: DrawerProps) {
  const t = useTranslations("header");
  const rootRef = useRef<HTMLDivElement>(null);

  // Brief 7.2: overlay fades in (0.25s), the panel wipes in from the right (0.45s, power3.out),
  // items slide in with their titles scrambling; closing wipes the panel back out (0.3s).
  useGSAP(
    () => {
      const root = rootRef.current;
      const panel = panelRef.current;
      const overlay = root?.querySelector("[data-drawer-overlay]");
      if (!root || !panel || !overlay) return;
      const reduced = window.matchMedia(MEDIA.reducedMotion).matches;

      if (open) {
        if (reduced) return;
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, overwrite: true });
        gsap.fromTo(panel, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.45, ease: "power3.out", overwrite: true });
        gsap.fromTo(
          root.querySelectorAll("[data-drawer-item]"),
          { opacity: 0, x: 28 },
          { opacity: 1, x: 0, stagger: 0.05, delay: 0.12, ...SPRINGS.ITEM },
        );
        root.querySelectorAll<HTMLElement>("[data-drawer-title]").forEach((title, i) => {
          scramble(title, title.textContent ?? "", { duration: 0.45, delay: 0.15 + i * 0.05 });
        });
        gsap.fromTo(
          root.querySelectorAll("[data-drawer-extra]"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.06, delay: 0.35, ...SPRINGS.ITEM },
        );
        return;
      }

      if (!visible) return;
      if (reduced) {
        onHidden();
        return;
      }
      gsap.to(overlay, { opacity: 0, duration: 0.3, overwrite: true });
      gsap.to(panel, { clipPath: "inset(0 0 0 100%)", duration: 0.3, ease: "power3.in", overwrite: true, onComplete: onHidden });
    },
    { dependencies: [open], scope: rootRef },
  );

  return (
    <div ref={rootRef} id="site-drawer" hidden={!visible} className="fixed inset-0 z-75">
      {/* Esc and the close button cover keyboard users; this is the pointer shortcut. */}
      <div
        data-drawer-overlay
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
            className="tap-area border border-field-border px-3 py-2.25 font-mono text-xs leading-none tracking-widest uppercase transition-colors duration-150 ease-entrance hover:border-primary hover:text-primary-accessible"
          >
            <span aria-hidden="true">[ </span>
            {t("menuClose")}
            <span aria-hidden="true"> ]</span>
          </button>
        </div>

        <nav aria-label={t("sectionsAria")}>
          <ol className="border-t border-border">
            {ACT_IDS.map((id, i) => (
              <li key={id} data-drawer-item>
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
                    <span className="sr-only">{t(`menuItems.${id}`)}</span>
                    {/* The scramble writes here, so the link's accessible name never shows glyphs. */}
                    <span data-drawer-title aria-hidden="true">
                      {t(`menuItems.${id}`)}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div data-drawer-extra className="flex flex-wrap items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div data-drawer-extra className="mt-auto">
          <BracketPanel className="font-mono text-xs leading-relaxed tracking-wider uppercase">
            <p>
              <StatusDot />
              {t("status")}
            </p>
            {/* One long word: on narrow phones it breaks after the @, and anywhere as a last resort. */}
            <p className="normal-case wrap-anywhere">
              {SITE.email.split("@")[0]}@<wbr />
              {SITE.email.split("@")[1]}
            </p>
          </BracketPanel>
        </div>
      </div>
    </div>
  );
}
