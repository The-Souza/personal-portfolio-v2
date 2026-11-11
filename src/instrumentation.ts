import type { Instrumentation } from "next";
import { logLine } from "@/lib/errors/report";

/**
 * Server errors, as one tagged line next to Next's own log of the error: search the Vercel logs
 * for the digest a visitor sends from the error page and the route it broke on.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;
  console.error(
    logLine("server-error", {
      digest,
      message: error instanceof Error ? error.message : String(error),
      path: request.path,
      routePath: context.routePath,
      routeType: context.routeType,
    }),
  );
};
