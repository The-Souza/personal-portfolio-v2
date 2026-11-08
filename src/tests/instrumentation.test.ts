import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { onRequestError } from "@/instrumentation";

const request = { path: "/pt", method: "GET", headers: {} };
const context = {
  routerKind: "App Router",
  routePath: "/[locale]",
  routeType: "render",
  renderSource: "react-server-components",
  revalidateReason: undefined,
} as const;

describe("onRequestError", () => {
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    error = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("registra uma linha marcada com o digest, a rota e o tipo", async () => {
    await onRequestError(Object.assign(new Error("quebrou"), { digest: "126118591" }), request, context);
    expect(JSON.parse(error.mock.calls[0][0] as string)).toEqual({
      kind: "server-error",
      digest: "126118591",
      message: "quebrou",
      path: "/pt",
      routePath: "/[locale]",
      routeType: "render",
    });
  });

  it("aceita um valor que não é Error", async () => {
    await onRequestError("texto", request, context);
    const line = JSON.parse(error.mock.calls[0][0] as string);
    expect(line.message).toBe("texto");
    expect(line).not.toHaveProperty("digest");
  });
});
