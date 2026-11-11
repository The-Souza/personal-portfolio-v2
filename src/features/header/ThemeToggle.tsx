"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { MEDIA } from "@/lib/motion/breakpoints";
import { cn } from "@/lib/utils";

/**
 * Labels switch through the `dark:` variant instead of the theme state, so the
 * server HTML and the first client render match whatever theme is saved.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("header.theme");
  const { resolvedTheme, setTheme } = useTheme();

  // Brief 7.4: the new theme sweeps in from the top through View Transitions (the animation is
  // in globals.css); with reduced motion, or without support, it just switches.
  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const reducedMotion = window.matchMedia(MEDIA.reducedMotion).matches;
    if (reducedMotion || !document.startViewTransition) {
      setTheme(next);
      return;
    }
    document.startViewTransition(() => {
      // The transition snapshots the page once this returns, but next-themes applies the theme
      // in an effect, after the render: apply it here the same way it will (both classes and the
      // color-scheme, or native scrollbars and controls would sweep in with the old scheme).
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      setTheme(next);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "tap-area inline-flex items-center gap-2.5 border border-field-border px-2.5 py-2 font-mono text-xs leading-none tracking-widest text-foreground uppercase transition-colors duration-150 ease-entrance hover:border-primary hover:text-primary-accessible",
        className,
      )}
    >
      {/* The name starts with the word on screen (WCAG 2.5.3): voice control users say "Noite". */}
      <span className="sr-only dark:hidden">{t("toNight")}</span>
      <span className="hidden dark:block dark:sr-only">{t("toDay")}</span>
      <span aria-hidden="true">
        <span className="dark:hidden">{t("day")}</span>
        <span className="hidden dark:inline">{t("night")}</span>
      </span>
      <span aria-hidden="true" className="relative h-3 w-6.5 border border-current">
        <span className="absolute top-0.5 left-0.5 h-1.5 w-2.25 translate-x-2.75 bg-primary dark:translate-x-0" />
      </span>
    </button>
  );
}
