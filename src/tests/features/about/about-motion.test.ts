import { describe, expect, it } from "vitest";
import { hasEntered, markerFrame, parseCount } from "@/features/about/about-motion";

describe("hasEntered", () => {
  it("considera já entrado o que passou do ponto de disparo", () => {
    expect(hasEntered(500, 800, 0.82)).toBe(true);
    expect(hasEntered(-200, 800, 0.82)).toBe(true);
  });

  it("anima o que ainda está abaixo do ponto de disparo", () => {
    expect(hasEntered(700, 800, 0.82)).toBe(false);
    expect(hasEntered(2000, 800, 0.82)).toBe(false);
  });
});

describe("parseCount", () => {
  it("lê números inteiros para a contagem", () => {
    expect(parseCount("723")).toBe(723);
    expect(parseCount("150")).toBe(150);
  });

  it("não conta valores que não são inteiros", () => {
    expect(parseCount("v1.5.1")).toBeNull();
    expect(parseCount("1.5")).toBeNull();
    expect(parseCount("")).toBeNull();
  });
});

describe("markerFrame", () => {
  it("começa no topo do trilho, sem giro", () => {
    expect(markerFrame(0, 1200)).toEqual({ y: 0, rotation: 0 });
  });

  it("acompanha o fio e gira 450° no total", () => {
    expect(markerFrame(1, 1200)).toEqual({ y: 1200, rotation: 450 });
    expect(markerFrame(0.5, 1200)).toEqual({ y: 600, rotation: 225 });
  });
});
