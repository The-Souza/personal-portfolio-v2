/**
 * The texts of the global error page, loaded only when it shows. A static import put both
 * catalogs (~17 KB gzipped) in a chunk Next loads on every page, since it preloads global-error;
 * Turbopack doesn't tree-shake JSON, so a named import kept the whole file. Each locale is its own
 * lazy chunk now. One promise per locale, as React's `use()` needs a stable one.
 */
const CATALOGS = {
  pt: () => import("../../../../messages/pt.json"),
  en: () => import("../../../../messages/en.json"),
};

type ErrorLocale = keyof typeof CATALOGS;
type Catalog = Awaited<ReturnType<(typeof CATALOGS)["pt"]>>["default"];
export type ErrorMessages = Pick<Catalog, "header" | "special" | "error">;

const loaded = new Map<ErrorLocale, Promise<ErrorMessages>>();

export function loadErrorMessages(locale: ErrorLocale): Promise<ErrorMessages> {
  let messages = loaded.get(locale);
  if (!messages) {
    messages = CATALOGS[locale]().then(({ default: { header, special, error } }) => ({ header, special, error }));
    loaded.set(locale, messages);
  }
  return messages;
}
