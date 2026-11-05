"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Labels switch through the `dark:` variant instead of the theme state, so the
 * server HTML and the first client render match whatever theme is saved.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("header.theme");
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex items-center gap-2.5 border border-field-border px-2.5 py-2 font-mono text-xs leading-none tracking-widest text-foreground uppercase transition-colors duration-150 ease-entrance hover:border-primary hover:text-primary-accessible",
        className,
      )}
    >
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
