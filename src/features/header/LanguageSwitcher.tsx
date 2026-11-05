"use client";

import { ACT_IDS } from "@/content/acts";
import {
  consumeScrollPosition,
  localeHref,
  saveScrollPosition,
} from "@/features/header/locale-switch";
import { useActiveSection } from "@/features/hud/use-active-section";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { type MouseEvent, useEffect } from "react";

/**
 * Plain links on purpose: a client navigation would keep each locale's ThemeProvider
 * alive in a hidden <Activity>, restoring a stale theme when coming back.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const current = useLocale();
  const { index } = useActiveSection();

  useEffect(() => {
    const y = consumeScrollPosition();
    if (y !== null) window.scrollTo(0, y);
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
