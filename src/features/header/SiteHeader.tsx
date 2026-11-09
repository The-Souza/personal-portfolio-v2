"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { ACT_IDS, NAV_IDS } from "@/content/acts";
import { isBootDone, onBootHandover } from "@/features/boot/boot-state";
import { Drawer } from "@/features/header/Drawer";
import { LanguageSwitcher } from "@/features/header/LanguageSwitcher";
import { LogoLink } from "@/features/header/LogoLink";
import { ThemeToggle } from "@/features/header/ThemeToggle";
import { useDrawer } from "@/features/header/use-drawer";
import { useActiveSection } from "@/features/hud/use-active-section";
import { ActionLink } from "@/features/shared/ActionLink";
import { Container } from "@/features/shared/Container";
import { MEDIA } from "@/lib/motion/breakpoints";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { SPRINGS } from "@/lib/motion/spring";

export function SiteHeader() {
  const t = useTranslations("header");
  const { open, visible, openDrawer, close, onHidden, navigate, triggerRef, panelRef } = useDrawer();
  const { index } = useActiveSection();
  const headerRef = useRef<HTMLElement>(null);

  // Brief 7.1: the header drops in (yPercent −100 → 0, ITEM) when the boot hands over.
  useGSAP(
    (_context, contextSafe) => {
      const header = headerRef.current;
      if (!header || !contextSafe || isBootDone() || window.matchMedia(MEDIA.reducedMotion).matches) return;
      gsap.set(header, { yPercent: -100 });
      return onBootHandover(contextSafe(() => gsap.to(header, { yPercent: 0, ...SPRINGS.ITEM })));
    },
    { scope: headerRef },
  );

  return (
    <>
      {/* Outside the header, which slides in after the boot: the first Tab must always find it. */}
      <a
        href="#main"
        // The padding goes with `focus:`: `not-sr-only` resets it to 0.
        className="sr-only z-50 bg-primary font-mono text-label text-primary-foreground uppercase focus:not-sr-only focus:fixed focus:top-2 focus:left-3 focus:px-4 focus:py-3"
      >
        {t("skip")}
      </a>
      <header
        ref={headerRef}
        aria-label={t("aria")}
        className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/86 backdrop-blur-sm"
      >
        {/* The HUD sits below the header, so the header keeps the plain side margins. */}
        <Container className="relative flex h-14 items-center justify-between gap-6 tablet:pr-4 rail:pr-10">
          <LogoLink name={t("logoName")} suffix={t("logoSuffix")} label={t("logoAria")} />

          {/* Centered on the page, not between its neighbors, which have different widths. */}
          <nav aria-label={t("sectionsAria")} className="absolute left-1/2 hidden -translate-x-1/2 gap-10 lg:flex">
            {NAV_IDS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                // The act on screen, as in the drawer and the side HUD.
                aria-current={ACT_IDS[index] === id ? "true" : undefined}
                className="text-sm tracking-wider text-muted-foreground uppercase transition-colors duration-150 ease-entrance hover:text-primary-accessible aria-current:text-primary-accessible"
              >
                {t(`nav.${id}`)}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <LanguageSwitcher className="hidden lg:flex" />
            <ThemeToggle className="hidden lg:inline-flex" />
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls="site-drawer"
              onClick={openDrawer}
              className="inline-flex items-center gap-2.5 border border-field-border px-3 py-2.25 font-mono text-xs leading-none tracking-widest text-foreground uppercase transition-colors duration-150 ease-entrance hover:border-primary hover:text-primary-accessible lg:hidden"
            >
              {t("menu")}
              <span aria-hidden="true" className="flex flex-col gap-0.75">
                <span className="block h-0.5 w-3.5 bg-current" />
                <span className="block h-0.5 w-2.25 bg-current" />
              </span>
            </button>
            <ActionLink href="#contact" className="hidden lg:inline">
              {t("contact")}
            </ActionLink>
          </div>
        </Container>
      </header>

      <Drawer
        open={open}
        visible={visible}
        activeIndex={index}
        panelRef={panelRef}
        onClose={close}
        onNavigate={navigate}
        onHidden={onHidden}
      />
    </>
  );
}
