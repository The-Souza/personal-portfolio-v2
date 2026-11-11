"use client";

import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { use } from "react";
import { loadErrorMessages } from "@/features/special/error/error-messages";
import { ErrorView } from "@/features/special/error/ErrorView";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

/**
 * Errors in the root layout itself (brief, section 11): the same ErrorView, but this file replaces
 * the layout, so it brings its own <html> and <body>, styles, fonts and texts. The locale comes
 * from the URL, as there's no provider left to ask. The texts load only when this page shows
 * (see loadErrorMessages); on the server `use()` waits for them, so the HTML arrives complete.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const path = usePathname();
  const first = path.split("/").filter(Boolean)[0];
  const locale = routing.locales.find((candidate) => candidate === first) ?? routing.defaultLocale;
  const messages = use(loadErrorMessages(locale));

  return (
    <html lang={htmlLang(locale)} className={cn(fontVariables, "h-full antialiased")}>
      <body className="min-h-dvh overflow-x-clip">
        <title>{messages.error.metaTitle}</title>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorView error={error} retry={retry} locale={locale} path={path} file="global-error.tsx" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
