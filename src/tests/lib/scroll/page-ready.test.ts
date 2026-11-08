import { beforeEach, describe, expect, it, vi } from "vitest";

describe("page-ready", () => {
  beforeEach(() => vi.resetModules());

  const load = () => import("@/lib/scroll/page-ready");

  it("avisa quem espera quando a página fica pronta", async () => {
    const { markPageReady, onPageReady } = await load();
    const callback = vi.fn();
    onPageReady(callback);
    expect(callback).not.toHaveBeenCalled();
    markPageReady();
    expect(callback).toHaveBeenCalledOnce();
  });

  it("chama na hora quem chega depois da página pronta", async () => {
    const { markPageReady, onPageReady } = await load();
    markPageReady();
    const callback = vi.fn();
    onPageReady(callback);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("não chama quem cancelou antes", async () => {
    const { markPageReady, onPageReady } = await load();
    const callback = vi.fn();
    const cancel = onPageReady(callback);
    cancel();
    markPageReady();
    expect(callback).not.toHaveBeenCalled();
  });

  it("avisa cada um uma vez só, mesmo marcando de novo", async () => {
    const { markPageReady, onPageReady } = await load();
    const callback = vi.fn();
    onPageReady(callback);
    markPageReady();
    markPageReady();
    expect(callback).toHaveBeenCalledOnce();
  });
});
