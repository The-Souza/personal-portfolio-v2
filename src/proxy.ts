import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { carryIntlHeaders, isNotFoundPage, trustedOrigin, unknownRouteTarget, wantsHtml } from "@/i18n/unknown-route";

const intl = createMiddleware(routing);
/** How long the proxy waits for its own 404 page before falling back to the rewrite. */
const FETCH_TIMEOUT_MS = 2000;

export default async function proxy(request: NextRequest) {
  const response = intl(request);
  // next-intl redirected (a path without a locale): the next request comes back here.
  if (response.headers.has("location")) return response;

  const target = unknownRouteTarget(request.nextUrl.pathname, routing.locales);
  if (!target) return response;
  const origin = trustedOrigin(request.url);
  // Both responses keep what next-intl set (its locale cookie), see carryIntlHeaders.
  const rewrite = () => {
    const rewritten = NextResponse.rewrite(new URL(target, request.url));
    carryIntlHeaders(response.headers, rewritten.headers);
    return rewritten;
  };

  // A client navigation asks for the RSC payload, not HTML; and a request whose Host isn't one
  // of the app's must not choose where the fetch below goes. Both just render the 404 route.
  if (!wantsHtml(request.headers) || !origin) return rewrite();

  // A rewrite can't change the status of a prerendered page (it's served as cached, 200), so
  // the 404 route's HTML is fetched and returned with a real 404. If that fetch fails or brings
  // back something else (a protected preview's login page), the visitor still gets the 404 page,
  // through the rewrite, rather than a 500 or someone else's HTML.
  let page: Response;
  try {
    // Bounded: a slow 404 route (a cold start, a deploy in progress) must not hold the visit.
    page = await fetch(new URL(target, origin), {
      headers: { accept: "text/html" },
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return rewrite();
  }
  if (!isNotFoundPage(page)) return rewrite();
  const notFound = new NextResponse(page.body, { status: 404 });
  // Set, not copied: fetch already decoded the body, and the page is always our HTML.
  notFound.headers.set("content-type", "text/html; charset=utf-8");
  carryIntlHeaders(response.headers, notFound.headers);
  return notFound;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
