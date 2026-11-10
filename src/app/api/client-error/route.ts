import { logLine } from "@/lib/errors/report";
import { clientErrorSchema } from "@/lib/errors/schema";

/** Larger than any report the client builds (see the limits in report.ts). */
const MAX_BODY = 8192;

/**
 * Browser errors land in the server log (Vercel's, in production), as one tagged JSON line.
 * Public and unauthenticated by nature: the body is size-capped and validated, never echoed back.
 */
export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > MAX_BODY) return new Response(null, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }

  const report = clientErrorSchema.safeParse(json);
  if (!report.success) return new Response(null, { status: 400 });

  console.error(logLine("client-error", report.data));
  return new Response(null, { status: 204 });
}
