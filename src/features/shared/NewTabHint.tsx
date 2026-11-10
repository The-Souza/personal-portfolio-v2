import { useTranslations } from "next-intl";

/**
 * Tells screen readers a link opens a new tab; sighted visitors get the ↗ (aria-hidden). A server
 * component, so the callers with external links pass it as a child: the ActionLink itself also
 * renders inside client components, where the `shared` namespace doesn't reach.
 */
export function NewTabHint() {
  const t = useTranslations("shared");
  return <span className="sr-only"> {t("newTab")}</span>;
}
