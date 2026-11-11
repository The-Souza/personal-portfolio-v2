import { logLine } from "@/lib/errors/report";
import { clientErrorSchema } from "@/lib/errors/schema";

/** Larger than any report the client builds (see the limits in report.ts). */
const MAX_BODY = 8192;

/**
 * The body as text, or null past `max` bytes. It stops reading there: `request.text()` buffered
 * the whole body first, so a public endpoint's cap didn't limit the memory or time it spent.
 */
async function readCapped(request: Request, max: number) {
  if (Number(request.headers.get("content-length") ?? 0) > max) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Browser errors land in the server log (Vercel's, in production), as one tagged JSON line.
 * Public and unauthenticated by nature: the body is size-capped and validated, never echoed back.
 */
export async function POST(request: Request) {
  const body = await readCapped(request, MAX_BODY);
  if (body === null) return new Response(null, { status: 413 });

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
