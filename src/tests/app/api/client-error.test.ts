import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/client-error/route";

const post = (body: string) => POST(new Request("http://localhost/api/client-error", { method: "POST", body }));

/** A body sent in `chunks` pieces of `size` bytes, counting how many bytes the route pulled. */
function streamed(chunks: number, size: number, fill = "x") {
  const sent = { bytes: 0 };
  let left = chunks;
  // highWaterMark 0: the stream doesn't pull a chunk on its own, only when the route reads.
  const body = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        if (left-- <= 0) return controller.close();
        sent.bytes += size;
        controller.enqueue(new TextEncoder().encode(fill.repeat(size)));
      },
    },
    { highWaterMark: 0 },
  );
  const request = new Request("http://localhost/api/client-error", { method: "POST", body, duplex: "half" } as RequestInit);
  return { request, sent };
}

describe("POST /api/client-error", () => {
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("registra um relato válido no log e responde 204", async () => {
    const response = await post(JSON.stringify({ source: "window", message: "quebrou", path: "/pt" }));
    expect(response.status).toBe(204);
    expect(error).toHaveBeenCalledOnce();
    expect(JSON.parse(error.mock.calls[0][0] as string)).toMatchObject({ kind: "client-error", message: "quebrou", path: "/pt" });
  });

  it("recusa JSON inválido com 400, sem registrar", async () => {
    expect((await post("{quebrado")).status).toBe(400);
    expect(error).not.toHaveBeenCalled();
  });

  it("recusa um relato fora do formato com 400", async () => {
    expect((await post(JSON.stringify({ source: "window", message: "" }))).status).toBe(400);
    expect(error).not.toHaveBeenCalled();
  });

  it("recusa corpo grande demais com 413", async () => {
    const huge = JSON.stringify({ source: "window", message: "x", path: "/pt", stack: "s".repeat(20000) });
    expect((await post(huge)).status).toBe(413);
    expect(error).not.toHaveBeenCalled();
  });

  it("para de ler um corpo enorme logo depois do limite, sem consumi-lo inteiro", async () => {
    // 100 MB announced in 1 KB pieces: the route must answer after about 8 KB.
    const { request, sent } = streamed(100 * 1024, 1024);
    expect((await POST(request)).status).toBe(413);
    expect(sent.bytes).toBeLessThanOrEqual(16 * 1024);
  });

  it("recusa pelo content-length declarado antes de ler o corpo", async () => {
    const { request, sent } = streamed(4, 1024);
    request.headers.set("content-length", String(50 * 1024 * 1024));
    expect((await POST(request)).status).toBe(413);
    expect(sent.bytes).toBe(0);
  });

  it("aceita um relato válido que chega em pedaços", async () => {
    const report = JSON.stringify({ source: "promise", message: "pedaços", path: "/en" });
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const bytes = new TextEncoder().encode(report);
        for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7));
        controller.close();
      },
    });
    const response = await POST(new Request("http://localhost/api/client-error", { method: "POST", body, duplex: "half" } as RequestInit));
    expect(response.status).toBe(204);
  });
});
