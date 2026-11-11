import { SITE } from "@/content/site";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";

type Env = Record<string, string | undefined>;

/**
 * The site's public origin: `NEXT_PUBLIC_SITE_URL` once there's a domain, the production domain
 * Vercel provides until then, the local server in development.
 */
export function siteUrl(env: Env = process.env) {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/** hreflang links: each language to its page, Portuguese as the default. */
export function languageAlternates(base: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[htmlLang(locale)] = `${base}/${locale}`;
  languages["x-default"] = `${base}/${routing.defaultLocale}`;
  return languages;
}

/** Structured data for the home: the person and The Souza Tech, linked both ways. */
export function personJsonLd({ url, description, jobTitle, lang }: { url: string; description: string; jobTitle: string; lang: string }) {
  const personId = `${url}#person`;
  const organizationId = `${SITE.companyUrl}#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: "Guilherme Campos",
        url,
        description,
        jobTitle,
        inLanguage: lang,
        email: `mailto:${SITE.email}`,
        address: { "@type": "PostalAddress", addressLocality: "Osasco", addressRegion: "SP", addressCountry: "BR" },
        worksFor: { "@id": organizationId },
        sameAs: [SITE.linkedinUrl, SITE.githubUrl],
      },
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "The Souza Tech",
        url: SITE.companyUrl,
        email: `mailto:${SITE.email}`,
        founder: { "@id": personId },
      },
    ],
  };
}
