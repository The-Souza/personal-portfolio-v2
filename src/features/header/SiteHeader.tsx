"use client";

import { useTranslations } from "next-intl";
import { NAV_IDS } from "@/content/acts";
import { Drawer } from "@/features/header/Drawer";
import { LanguageSwitcher } from "@/features/header/LanguageSwitcher";
import { ThemeToggle } from "@/features/header/ThemeToggle";
import { useDrawer } from "@/features/header/use-drawer";
import { useActiveSection } from "@/features/hud/use-active-section";
import { ActionLink } from "@/features/shared/ActionLink";
import { Container } from "@/features/shared/Container";

export function SiteHeader() {
  const t = useTranslations("header");
  const { open, openDrawer, close, navigate, triggerRef, panelRef } = useDrawer();
  const { index } = useActiveSection();

  return (
    <>
      <header aria-label={t("aria")} className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/86 backdrop-blur-sm">
        <Container className="relative flex h-14 items-center justify-between gap-6">
          <a href="#hero" aria-label={t("logoAria")} className="font-heading text-base font-bold tracking-wide text-foreground uppercase">
            <span aria-hidden="true">{t("logoName")}</span>
            <span aria-hidden="true" className="text-primary-accessible">
              {t("logoSuffix")}
            </span>
          </a>

          {/* Centered on the page, not between its neighbors, which have different widths. */}
          <nav aria-label={t("sectionsAria")} className="absolute left-1/2 hidden -translate-x-1/2 gap-10 lg:flex">
            {NAV_IDS.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-sm tracking-wider text-muted-foreground uppercase transition-colors duration-150 ease-entrance hover:text-primary-accessible"
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

      <Drawer open={open} activeIndex={index} panelRef={panelRef} onClose={close} onNavigate={navigate} />
    </>
  );
}
