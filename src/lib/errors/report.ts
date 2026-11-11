export const LIMITS = { message: 500, stack: 4000, path: 300, digest: 64 } as const;

/**
 * A browser error sent to `/api/client-error`: what happened and where, nothing about the
 * visitor. `window` and `promise` come from instrumentation-client, `boundary` from the error page.
 * A plain type, not `z.infer`: this module reaches the client on every page, and the schema that
 * checks it (`schema.ts`) would bring zod along. The schema `satisfies` this type, so they agree.
 */
export interface ClientErrorReport {
  source: "window" | "promise" | "boundary";
  message: string;
  stack?: string;
  path: string;
  digest?: string;
}

/** Any thrown value as text. Some don't convert (no prototype, a throwing toString): the report
 * must not throw inside the very listener that is reporting an error. */
function textOf(value: unknown) {
  try {
    return String(value);
  } catch {
    return "(valor sem texto)";
  }
}

/** Builds a report that always fits the schema, from any thrown value. */
export function toClientReport(error: unknown, source: ClientErrorReport["source"], path: string): ClientErrorReport {
  const isError = error instanceof Error;
  const message = (isError ? error.message : textOf(error)) || "(sem mensagem)";
  const digest = isError ? (error as Error & { digest?: string }).digest : undefined;
  return {
    source,
    message: message.slice(0, LIMITS.message),
    stack: isError ? error.stack?.slice(0, LIMITS.stack) : undefined,
    path: path.slice(0, LIMITS.path),
    ...(digest ? { digest: digest.slice(0, LIMITS.digest) } : {}),
  };
}

/** One JSON line tagged by kind, to search the Vercel logs for (`"kind":"client-error"`, a digest). */
export function logLine(kind: "client-error" | "server-error", data: Record<string, unknown>) {
  return JSON.stringify({ kind, ...data });
}
