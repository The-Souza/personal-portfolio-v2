import { z } from "zod";
import { type ClientErrorReport, LIMITS } from "@/lib/errors/report";

/**
 * Checks a report at `/api/client-error`. Server only: imported from the client, it put zod
 * (about 30 KB gzipped) in a chunk every page loads.
 */
export const clientErrorSchema = z
  .object({
    source: z.enum(["window", "promise", "boundary"]),
    message: z.string().min(1).max(LIMITS.message),
    stack: z.string().max(LIMITS.stack).optional(),
    path: z.string().max(LIMITS.path),
    digest: z.string().max(LIMITS.digest).optional(),
  })
  .strict() satisfies z.ZodType<ClientErrorReport>;
