"use client";

import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import en from "../../messages/en.json";
import pt from "../../messages/pt.json";
import { ErrorView } from "@/features/special/ErrorView";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

const MESSAGES = { pt, en } as const;

/**
 * Errors in the root layout itself (brief, section 11): the same ErrorView, but this file replaces
 * the layout, so it brings its own <html> and <body>, styles, fonts and texts. The locale comes
 * from the URL, as there's no provider left to ask.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const path = usePathname();
  const first = path.split("/").filter(Boolean)[0];
  const locale = routing.locales.find((candidate) => candidate === first) ?? routing.defaultLocale;
  const { header, special, error: errorTexts } = MESSAGES[locale];

  return (
    <html lang={htmlLang(locale)} className={cn(fontVariables, "h-full antialiased")}>
      <body className="min-h-dvh overflow-x-clip">
        <title>{errorTexts.metaTitle}</title>
        <NextIntlClientProvider locale={locale} messages={{ header, special, error: errorTexts }}>
          <ErrorView error={error} retry={retry} locale={locale} path={path} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
