"use client";

import { ACT_IDS } from "@/content/acts";
import { requestBootSkip } from "@/features/boot/boot-session";
import {
  consumeScrollAnchor,
  localeHref,
  type ScrollAnchor,
  saveScrollAnchor,
  scrollTargetFor,
  sectionTop,
} from "@/features/header/locale-switch";
import { useActiveSection } from "@/features/hud/use-active-section";
import { routing } from "@/i18n/routing";
import { ScrollTrigger } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { type MouseEvent, useLayoutEffect, useRef } from "react";

/**
 * Plain links on purpose: a client navigation would keep each locale's ThemeProvider
 * alive in a hidden <Activity>, restoring a stale theme when coming back.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const current = useLocale();
  const { index } = useActiveSection();
  // A ref survives StrictMode's double run in dev, so the anchor is read once and used by both.
  const anchorRef = useRef<ScrollAnchor | null | undefined>(undefined);

  useLayoutEffect(() => {
    if (anchorRef.current === undefined) anchorRef.current = consumeScrollAnchor();
    const anchor = anchorRef.current;
    const restore = () => {
      const top = anchor && sectionTop(anchor.section);
      if (anchor && top !== null) window.scrollTo(0, scrollTargetFor(anchor, top));
    };

    // Before paint, so the acts below (later in the tree) measure what is already on screen.
    restore();
    // The pins (hero, projects) only get their scroll length when ScrollTrigger refreshes,
    // which also happens on the window load event; until then the same offset lands too high.
    // So: refresh now, restore again, and once more after any refresh in the next 2s.
    const frame = requestAnimationFrame(() => {
      if (anchor) {
        ScrollTrigger.refresh();
        restore();
      }
      document.documentElement.classList.remove("locale-restoring");
    });
    if (anchor) ScrollTrigger.addEventListener("refresh", restore);
    const stopListening = window.setTimeout(() => ScrollTrigger.removeEventListener("refresh", restore), 2000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(stopListening);
      ScrollTrigger.removeEventListener("refresh", restore);
    };
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
    const section = ACT_IDS[index];
    const top = sectionTop(section);
    if (top !== null) saveScrollAnchor({ section, offset: window.scrollY - top });
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
