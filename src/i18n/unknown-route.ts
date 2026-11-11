import { siteUrl } from "@/features/seo/seo";

/** The route the 404 is rendered at, under each locale (`/pt/off-the-map`). */
export const NOT_FOUND_PATH = "off-the-map";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * The origin the proxy may fetch the 404 page from: the request's own, but only when its host is
 * one of the app's (the site URL, the domains Vercel provides, the local server). The host comes
 * from the request's Host header, so anything else could point the fetch elsewhere (SSRF).
 * Loopback hosts pass only in development: in production any port would do (`localhost:6379`
 * reaching an internal service), so there only `TRUSTED_LOCAL_ORIGIN` does, the exact origin of
 * a local production server (the e2e's).
 */
export function trustedOrigin(requestUrl: string, env: Record<string, string | undefined> = process.env) {
  const url = new URL(requestUrl);
  const hosts = new Set(
    [new URL(siteUrl(env)).host, env.VERCEL_URL, env.VERCEL_BRANCH_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(
      (host): host is string => Boolean(host),
    ),
  );
  const local = LOCAL_HOSTS.has(url.hostname) && (env.NODE_ENV === "development" || env.TRUSTED_LOCAL_ORIGIN === url.origin);
  return hosts.has(url.host) || local ? url.origin : null;
}

/**
 * Whether the request is a document visit, which asks for HTML. A client navigation asks for the
 * RSC payload instead, but Next's proxy adapter strips both its markers (the `rsc` header and the
 * `_rsc` query) before the proxy runs; its fetch never accepts `text/html`, which is what stays.
 */
export function wantsHtml(headers: Headers) {
  return !headers.has("rsc") && (headers.get("accept") ?? "").includes("text/html");
}

/**
 * Whether the proxy's fetch got the 404 route's own page. Anything else (a protected preview's
 * login page, an error, a redirect) must not be served as the 404: the proxy falls back to a
 * rewrite, which shows the right page with a 200.
 */
export function isNotFoundPage(response: Response) {
  return response.status === 200 && (response.headers.get("content-type") ?? "").startsWith("text/html");
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
