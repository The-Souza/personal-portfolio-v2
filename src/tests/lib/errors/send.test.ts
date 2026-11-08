import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ClientErrorReport } from "@/lib/errors/report";

const report = (message: string): ClientErrorReport => ({ source: "window", message, path: "/pt" });

async function load() {
  vi.resetModules();
  return import("@/lib/errors/send");
}

describe("sendClientError", () => {
  let sendBeacon: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { ...navigator, sendBeacon });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("manda o relato para a rota de erros", async () => {
    const { sendClientError } = await load();
    sendClientError(report("quebrou"));
    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(sendBeacon.mock.calls[0][0]).toBe("/api/client-error");
  });

  it("manda o mesmo erro uma vez só", async () => {
    const { sendClientError } = await load();
    sendClientError(report("quebrou"));
    sendClientError(report("quebrou"));
    expect(sendBeacon).toHaveBeenCalledOnce();
  });

  it("para depois de 10 erros diferentes na mesma página", async () => {
    const { sendClientError } = await load();
    for (let i = 0; i < 15; i++) sendClientError(report(`erro ${i}`));
    expect(sendBeacon).toHaveBeenCalledTimes(10);
  });

  it("sem sendBeacon, usa fetch com keepalive", async () => {
    vi.stubGlobal("navigator", { ...navigator, sendBeacon: undefined });
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetch);
    const { sendClientError } = await load();
    sendClientError(report("quebrou"));
    expect(fetch).toHaveBeenCalledWith("/api/client-error", expect.objectContaining({ method: "POST", keepalive: true }));
  });
});
