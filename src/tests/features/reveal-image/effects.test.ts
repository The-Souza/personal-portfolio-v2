import { describe, expect, it } from "vitest";
import { BAYER_4, ditherThreshold, mosaicBlock } from "@/features/reveal-image/effects";

describe("mosaicBlock", () => {
  it("começa nos blocos de 64px", () => {
    expect(mosaicBlock(0)).toBe(64);
  });

  it("passa pelos tamanhos 64 → 32 → 16 → 8 → 4 → 1", () => {
    expect([0, 0.2, 0.4, 0.55, 0.7, 0.9].map(mosaicBlock)).toEqual([64, 32, 16, 8, 4, 1]);
  });

  it("termina na imagem nítida", () => {
    expect(mosaicBlock(1)).toBe(1);
    expect(mosaicBlock(1.4)).toBe(1);
  });
});

describe("ditherThreshold", () => {
  it("usa a matriz Bayer 4×4 com os 16 níveis", () => {
    expect([...BAYER_4].sort((a, b) => a - b)).toEqual(Array.from({ length: 16 }, (_, i) => i));
  });

  it("fica entre 0 e 1 e repete a cada 4 células", () => {
    const value = ditherThreshold(1, 2, () => 0.5);
    expect(value).toBeGreaterThan(0);
    expect(value).toBeLessThan(1);
    expect(ditherThreshold(5, 6, () => 0.5)).toBe(value);
  });
});
