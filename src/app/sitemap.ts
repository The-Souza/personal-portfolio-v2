import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, siteUrl } from "@/lib/seo";

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
