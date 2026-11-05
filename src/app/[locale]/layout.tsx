import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Boot } from "@/features/boot/Boot";
import { BOOT_SKIP_SCRIPT } from "@/features/boot/boot-session";
import { SiteHeader } from "@/features/header/SiteHeader";
import { SideHud } from "@/features/hud/SideHud";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { LenisProvider } from "@/lib/motion/lenis-provider";
import { cn } from "@/lib/utils";
import "@/app/globals.css";

/** Only what client components read; the acts render on the server and don't need to ship their texts. */
const CLIENT_NAMESPACES = ["boot", "header", "hud", "copyEmail"] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]));

  return (
    // `dark` in the server HTML keeps Night as the theme without JS; next-themes takes over on the client.
    <html lang={htmlLang(locale)} suppressHydrationWarning className={cn(fontVariables, "dark h-full antialiased")}>
      <body className="min-h-dvh overflow-x-clip">
        {/* Without JS the boot never hands over, so its veil must not cover the content. */}
        <noscript dangerouslySetInnerHTML={{ __html: "<style>#boot{display:none}</style>" }} />
        {/* Runs before the veil below is painted; a constant string, no user input. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SKIP_SCRIPT }} />
        <NextIntlClientProvider messages={clientMessages}>
          <ThemeProvider>
            <LenisProvider>
              <Boot />
              <SiteHeader />
              <SideHud />
              {children}
            </LenisProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
