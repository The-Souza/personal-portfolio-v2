import { beforeEach, describe, expect, it, vi } from "vitest";
import { BOOT_SKIP_SCRIPT, consumeBootSkip, hasSeenBoot, markBootSeen, requestBootSkip } from "@/features/boot/boot-session";

describe("boot-session", () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.documentElement.className = "";
  });

  it("trata a primeira visita como nova", () => {
    expect(hasSeenBoot()).toBe(false);
  });

  it("lembra que o boot já rodou nesta sessão", () => {
    markBootSeen();
    expect(hasSeenBoot()).toBe(true);
  });

  it("não pula o boot sem um pedido", () => {
    expect(consumeBootSkip()).toBe(false);
  });

  it("pula o boot uma vez depois do pedido", () => {
    requestBootSkip();
    expect(consumeBootSkip()).toBe(true);
    expect(consumeBootSkip()).toBe(false);
  });

  it("marca o html para esconder o véu antes da primeira pintura", () => {
    requestBootSkip();
    new Function(BOOT_SKIP_SCRIPT)();
    expect(document.documentElement).toHaveClass("boot-skip");
  });

  it("esconde a página até a rolagem ser restaurada, com uma saída de segurança", () => {
    vi.useFakeTimers();
    requestBootSkip();
    new Function(BOOT_SKIP_SCRIPT)();
    expect(document.documentElement).toHaveClass("locale-restoring");
    vi.advanceTimersByTime(3000);
    expect(document.documentElement).not.toHaveClass("locale-restoring");
    vi.useRealTimers();
  });

  it("não marca o html sem um pedido", () => {
    new Function(BOOT_SKIP_SCRIPT)();
    expect(document.documentElement).not.toHaveClass("boot-skip");
  });
});
