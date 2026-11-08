import { getLocale, getTranslations } from "next-intl/server";
import { personJsonLd, siteUrl } from "@/features/seo/seo";
import { htmlLang } from "@/i18n/locale";

/** The home's structured data (brief, section 12): the person and The Souza Tech. */
export async function PersonJsonLd() {
  const locale = await getLocale();
  const t = await getTranslations("meta");
  const data = personJsonLd({
    url: `${siteUrl()}/${locale}`,
    description: t("description"),
    jobTitle: t("jobTitle"),
    lang: htmlLang(locale),
  });

  return (
    <script
      type="application/ld+json"
      // Our own constant data; "<" escaped so the JSON can't close the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
