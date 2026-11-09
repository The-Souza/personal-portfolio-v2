"use client";

import { ACT_IDS } from "@/content/acts";
import { requestBootSkip } from "@/features/boot/boot-session";
import {
  anchorAt,
  consumeScrollAnchor,
  hashSection,
  localeHref,
  type ScrollAnchor,
  saveScrollAnchor,
  scrollTargetFor,
  sectionTop,
  shouldRestoreScroll,
} from "@/features/header/locale-switch";
import { useActiveSection } from "@/features/hud/use-active-section";
import { routing } from "@/i18n/routing";
import { ScrollTrigger } from "@/lib/motion/gsap";
import { landingFor } from "@/lib/scroll/landing";
import { onPageReady } from "@/lib/scroll/page-ready";
import { settleScrubs } from "@/lib/scroll/scroll-keeper";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { type MouseEvent, useLayoutEffect } from "react";

// Read once per page load and shared: the header and the drawer each render a switcher, and
// StrictMode runs effects twice in dev. A second reader would find nothing, and show the page
// before the pins exist.
let pageAnchor: ScrollAnchor | null | undefined;

function loadAnchor() {
  if (pageAnchor === undefined) {
    const saved = consumeScrollAnchor();
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    // `boot-skip` comes from the inline script after a language switch.
    const localeSwitch = document.documentElement.classList.contains("boot-skip");
    pageAnchor = saved && shouldRestoreScroll(navigation?.type ?? "navigate", localeSwitch) ? saved : null;
  }
  return pageAnchor;
}

/**
 * Plain links on purpose: a client navigation would keep each locale's ThemeProvider
 * alive in a hidden <Activity>, restoring a stale theme when coming back.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("header");
  const current = useLocale();
  const { index } = useActiveSection();

  useLayoutEffect(() => {
    const anchor = loadAnchor();

    // The browser's own restore runs before the pins exist, on a page thousands of pixels
    // shorter, and clamps the position into an earlier act. The anchor restores it instead.
    history.scrollRestoration = "manual";
    const saveOnLeave = () => {
      const tops = ACT_IDS.flatMap((id) => {
        const top = sectionTop(id);
        return top === null ? [] : [{ id, top }];
      });
      const current = anchorAt(tops, window.scrollY);
      if (current) saveScrollAnchor(current);
    };
    window.addEventListener("pagehide", saveOnLeave);
    // A new navigation to `/pt#contact` has the same problem: the browser jumps to the hash on
    // the server HTML, before the pins exist, and lands acts too early. It goes where a click
    // on the link would (the section's landing point, e.g. Contact's finished poster).
    const hashId = anchor ? null : hashSection(window.location.hash, ACT_IDS);
    const target = () => {
      if (anchor) {
        const top = sectionTop(anchor.section);
        return top === null ? null : scrollTargetFor(anchor, top);
      }
      return hashId ? (landingFor(hashId) ?? sectionTop(hashId)) : null;
    };
    const restore = () => {
      const y = target();
      if (y === null) return;
      window.scrollTo(0, y);
      // Without this the Contact blade would sweep in again after the jump.
      settleScrubs();
    };

    const reveal = () => document.documentElement.classList.remove("locale-restoring");

    // Before paint, so the acts below (later in the tree) measure what is already on screen.
    restore();
    if (!anchor && !hashId) {
      const frame = requestAnimationFrame(reveal);
      return () => {
        window.removeEventListener("pagehide", saveOnLeave);
        cancelAnimationFrame(frame);
      };
    }

    // The pins (hero, projects, stack) add thousands of pixels, and they only exist once the page
    // has hydrated, which Next does after the header; until then the offset lands too low (in
    // Contact). So the page stays hidden until then: refresh, restore again and show it, then
    // restore once more after any refresh in the next 2s (the window load event refreshes too).
    let stopListening = 0;
    const cancelReady = onPageReady(() => {
      ScrollTrigger.refresh();
      restore();
      reveal();
      ScrollTrigger.addEventListener("refresh", restore);
      stopListening = window.setTimeout(() => ScrollTrigger.removeEventListener("refresh", restore), 2000);
    });
    return () => {
      window.removeEventListener("pagehide", saveOnLeave);
      cancelReady();
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
