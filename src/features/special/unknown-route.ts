import { siteUrl } from "@/lib/seo";

/** The route the 404 is rendered at, under each locale (`/pt/off-the-map`). */
export const NOT_FOUND_PATH = "off-the-map";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The origin the proxy may fetch the 404 page from: the request's own, but only when its host is
 * one of the app's (the site URL, the domains Vercel provides, the local server). The host comes
 * from the request's Host header, so anything else could point the fetch elsewhere (SSRF).
 */
export function trustedOrigin(requestUrl: string, env: Record<string, string | undefined> = process.env) {
  const url = new URL(requestUrl);
  const hosts = new Set(
    [new URL(siteUrl(env)).host, env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(
      (host): host is string => Boolean(host),
    ),
  );
  return hosts.has(url.host) || LOCAL_HOSTS.has(url.hostname) ? url.origin : null;
}

/**
 * The pages under a locale, as the path after it ("" is the home). Add a new page here, or the
 * proxy sends its URL to the 404. The 404 route itself is known: the proxy fetches it.
 */
const KNOWN_PATHS = new Set(["", NOT_FOUND_PATH]);

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
