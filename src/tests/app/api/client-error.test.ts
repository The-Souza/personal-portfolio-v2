import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/client-error/route";

const post = (body: string) => POST(new Request("http://localhost/api/client-error", { method: "POST", body }));

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
});
