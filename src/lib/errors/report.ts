import { z } from "zod";

const LIMITS = { message: 500, stack: 4000, path: 300, digest: 64 } as const;

/**
 * A browser error sent to `/api/client-error`: what happened and where, nothing about the
 * visitor. `window` and `promise` come from instrumentation-client, `boundary` from the error page.
 */
export const clientErrorSchema = z
  .object({
    source: z.enum(["window", "promise", "boundary"]),
    message: z.string().min(1).max(LIMITS.message),
    stack: z.string().max(LIMITS.stack).optional(),
    path: z.string().max(LIMITS.path),
    digest: z.string().max(LIMITS.digest).optional(),
  })
  .strict();

export type ClientErrorReport = z.infer<typeof clientErrorSchema>;

/** Builds a report that always fits the schema, from any thrown value. */
export function toClientReport(error: unknown, source: ClientErrorReport["source"], path: string): ClientErrorReport {
  const isError = error instanceof Error;
  const message = (isError ? error.message : String(error)) || "(sem mensagem)";
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
