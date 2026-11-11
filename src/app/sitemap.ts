import type { MetadataRoute } from "next";
import { languageAlternates, siteUrl } from "@/features/seo/seo";
import { routing } from "@/i18n/routing";

/** One page per locale, each linked to the others (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const languages = languageAlternates(base);
  return routing.locales.map((locale) => ({
    url: `${base}/${locale}`,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
