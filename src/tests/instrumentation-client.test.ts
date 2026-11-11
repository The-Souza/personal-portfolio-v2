import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("instrumentation-client", () => {
  let sendBeacon: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { ...navigator, sendBeacon });
    await import("@/instrumentation-client");
  });

  afterEach(() => vi.unstubAllGlobals());

  const sentReport = async () => JSON.parse(await (sendBeacon.mock.calls[0][1] as Blob).text());

  it("manda um erro não tratado da página", async () => {
    window.dispatchEvent(new ErrorEvent("error", { error: new Error("quebrou na página") }));
    expect(await sentReport()).toMatchObject({ source: "window", message: "quebrou na página", path: "/" });
  });

  it("manda uma promessa rejeitada sem tratamento", async () => {
    const event = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.assign(event, { reason: new Error("promessa quebrou") });
    window.dispatchEvent(event);
    expect(await sentReport()).toMatchObject({ source: "promise", message: "promessa quebrou" });
  });
});
