"use client";

import { ACT_IDS } from "@/content/acts";
import { requestBootSkip } from "@/features/boot/boot-session";
import {
  consumeScrollPosition,
  localeHref,
  saveScrollPosition,
} from "@/features/header/locale-switch";
import { useActiveSection } from "@/features/hud/use-active-section";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { type MouseEvent, useLayoutEffect } from "react";

/**
 * Plain links on purpose: a client navigation would keep each locale's ThemeProvider
 * alive in a hidden <Activity>, restoring a stale theme when coming back.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const current = useLocale();
  const { index } = useActiveSection();

  // A layout effect, so the position is back before paint and before the acts below (which
  // run later in the tree) measure what is already on screen.
  useLayoutEffect(() => {
    const y = consumeScrollPosition();
    if (y !== null) window.scrollTo(0, y);
    // Set by the inline script after a language switch; the page was hidden until now.
    document.documentElement.classList.remove("locale-restoring");
  }, []);

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    locale: string,
  ) => {
    if (locale === current) {
      event.preventDefault();
      return;
    }
    const hash = index > 0 ? `#${ACT_IDS[index]}` : window.location.hash;
    event.currentTarget.href = localeHref(locale, hash);
    saveScrollPosition(window.scrollY);
    // The switch is a full page load; the visitor already saw the boot, so the next page skips it.
    requestBootSkip();
  };

  return (
    <nav
      aria-label={t("language")}
      className={cn("flex border border-field-border", className)}
    >
      {routing.locales.map((locale) => (
        <a
          key={locale}
          href={localeHref(locale, "")}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
          onClick={(event) => handleClick(event, locale)}
          className="px-2.25 py-2 font-mono text-xs leading-none tracking-widest text-muted-foreground uppercase transition-colors duration-150 ease-entrance hover:text-primary-accessible aria-current:bg-primary aria-current:text-primary-foreground"
        >
          {locale}
        </a>
      ))}
    </nav>
  );
}
