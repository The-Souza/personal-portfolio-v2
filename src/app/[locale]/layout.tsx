import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();

  return (
    // `dark` in the server HTML keeps Night as the theme without JS; next-themes takes over on the client.
    <html lang={htmlLang(locale)} suppressHydrationWarning className={cn(fontVariables, "dark h-full antialiased")}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
