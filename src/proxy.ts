import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { isNotFoundPage, trustedOrigin, unknownRouteTarget, wantsHtml } from "@/i18n/unknown-route";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intl(request);
  // next-intl redirected (a path without a locale): the next request comes back here.
  if (response.headers.has("location")) return response;

  const target = unknownRouteTarget(request.nextUrl.pathname, routing.locales);
  if (!target) return response;
  const origin = trustedOrigin(request.url);
  const rewrite = () => NextResponse.rewrite(new URL(target, request.url));

  // A client navigation asks for the RSC payload, not HTML; and a request whose Host isn't one
  // of the app's must not choose where the fetch below goes. Both just render the 404 route.
  if (!wantsHtml(request.headers) || !origin) return rewrite();

  // A rewrite can't change the status of a prerendered page (it's served as cached, 200), so
  // the 404 route's HTML is fetched and returned with a real 404. If that fetch fails or brings
  // back something else (a protected preview's login page), the visitor still gets the 404 page,
  // through the rewrite, rather than a 500 or someone else's HTML.
  let page: Response;
  try {
    page = await fetch(new URL(target, origin), { headers: { accept: "text/html" }, redirect: "manual" });
  } catch {
    return rewrite();
  }
  if (!isNotFoundPage(page)) return rewrite();
  const notFound = new NextResponse(page.body, { status: 404 });
  // Set, not copied: fetch already decoded the body, and the page is always our HTML.
  notFound.headers.set("content-type", "text/html; charset=utf-8");
  // Keep what next-intl set (its locale cookie), but not its routing instructions: an
  // `x-middleware-next` would tell Next to carry on with the unknown path and show its own 404.
  response.headers.forEach((value, key) => {
    if (key !== "content-type" && !key.startsWith("x-middleware-")) notFound.headers.set(key, value);
  });
  return notFound;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
