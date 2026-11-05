"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/Button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function ShowcaseControls() {
  const t = useTranslations("showcase.controls");
  const { setTheme } = useTheme();
  const current = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border p-6">
      <Button arrow={false} onClick={() => setTheme("dark")}>
        {t("night")}
      </Button>
      <Button arrow={false} onClick={() => setTheme("light")}>
        {t("day")}
      </Button>
      <nav aria-label={t("language")} className="flex gap-4 font-mono text-eyebrow uppercase">
        {routing.locales.map((locale) => (
          <Link
            key={locale}
            href="/"
            locale={locale}
            aria-current={locale === current ? "page" : undefined}
            className={cn(
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              locale === current ? "text-primary-accessible" : "text-foreground",
            )}
          >
            {locale}
          </Link>
        ))}
      </nav>
    </div>
  );
}
