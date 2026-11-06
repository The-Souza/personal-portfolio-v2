import { describe, expect, it } from "vitest";
import { seededRandom, withAlpha } from "@/features/reveal-image/placeholder";

describe("withAlpha", () => {
  it("converte o hex do token em rgba", () => {
    expect(withAlpha("#02d2e3", 0.5)).toBe("rgba(2, 210, 227, 0.5)");
  });

  it("aceita espaços em volta, como vem do getComputedStyle", () => {
    expect(withAlpha(" #ffffff ", 1)).toBe("rgba(255, 255, 255, 1)");
  });

  it("devolve a cor como está se não for #rrggbb", () => {
    expect(withAlpha("red", 0.5)).toBe("red");
  });
});

describe("seededRandom", () => {
  it("repete a mesma sequência para a mesma semente", () => {
    const a = seededRandom(11);
    const b = seededRandom(11);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("fica entre 0 e 1", () => {
    const random = seededRandom(23);
    for (let i = 0; i < 50; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
