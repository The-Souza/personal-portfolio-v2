import { beforeEach, describe, expect, it, vi } from "vitest";

async function load() {
  vi.resetModules();
  return import("@/features/special/retry-attempts");
}

describe("retry-attempts", () => {
  beforeEach(() => vi.resetModules());

  it("começa sem tentativas", async () => {
    const { attemptsFor } = await load();
    expect(attemptsFor("abc")).toBe(0);
  });

  it("conta cada tentativa do mesmo erro", async () => {
    const { attemptsFor, recordAttempt } = await load();
    recordAttempt("abc");
    recordAttempt("abc");
    expect(attemptsFor("abc")).toBe(2);
  });

  it("conta cada erro à parte", async () => {
    const { attemptsFor, recordAttempt } = await load();
    recordAttempt("abc");
    expect(attemptsFor("xyz")).toBe(0);
  });

  it("usa o digest como chave e, sem ele, a mensagem", async () => {
    const { errorKey } = await load();
    expect(errorKey(Object.assign(new Error("boom"), { digest: "3f9a" }))).toBe("3f9a");
    expect(errorKey(new Error("boom"))).toBe("boom");
    expect(errorKey("texto solto")).toBe("texto solto");
  });
});
