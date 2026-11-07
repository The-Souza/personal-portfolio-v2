/** The route the 404 is rendered at, under each locale (`/pt/off-the-map`). */
export const NOT_FOUND_PATH = "off-the-map";

/**
 * The pages under a locale, as the path after it ("" is the home). Add a new page here, or the
 * proxy sends its URL to the 404.
 */
const KNOWN_PATHS = new Set([""]);

/**
 * Where the proxy rewrites a URL that no page matches: the 404 route of its locale, null for a
 * real page. A route that only calls notFound() is prerendered as an empty error shell under
 * cacheComponents (rendered in the browser, nothing without JS); the 404 route is a normal page.
 * Paths without a locale are left to next-intl, which redirects them first.
 */
export function unknownRouteTarget(pathname: string, locales: readonly string[]) {
  const [locale, ...rest] = pathname.split("/").filter(Boolean);
  if (!locale || !locales.includes(locale)) return null;
  const path = rest.join("/");
  return KNOWN_PATHS.has(path) ? null : `/${locale}/${NOT_FOUND_PATH}`;
}
