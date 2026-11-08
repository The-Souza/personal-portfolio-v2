import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { unknownRouteTarget } from "@/features/special/unknown-route";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const response = intl(request);
  // next-intl redirected (a path without a locale): the next request comes back here.
  if (response.headers.has("location")) return response;

  // A URL no page matches renders the locale's 404 route, with a real 404 status.
  const target = unknownRouteTarget(request.nextUrl.pathname, routing.locales);
  if (!target) return response;
  const notFound = NextResponse.rewrite(new URL(target, request.url), { status: 404 });
  // Keep what next-intl set (its locale cookie and headers).
  response.headers.forEach((value, key) => notFound.headers.set(key, value));
  return notFound;
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
