import type { Metadata } from "next";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { BOOT_SKIP_SCRIPT } from "@/features/boot/boot-session";
import { languageAlternates, siteUrl } from "@/features/seo/seo";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/AppProviders";
import "@/app/globals.css";

/** Only what client components read; the acts render on the server and don't need to ship their texts. */
const CLIENT_NAMESPACES = ["boot", "header", "hud", "copyEmail", "special", "error"] as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("meta");
  const base = siteUrl();
  const title = t("title");
  const description = t("description");
  // Designed per language in public/, 1200×630.
  const image = { url: `/og-${locale}.png`, width: 1200, height: 630, alt: t("ogAlt") };

  return {
    metadataBase: new URL(base),
    title: { default: title, template: "%s · Guilherme Campos" },
    description,
    alternates: { canonical: `/${locale}`, languages: languageAlternates(base) },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: "Guilherme Campos",
      title,
      description,
      locale: htmlLang(locale).replace("-", "_"),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
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
        {/* The boot, header and HUD live in the (site) group; the special pages skip them. */}
        <AppProviders messages={clientMessages}>{children}</AppProviders>
      </body>
    </html>
  );
}
