import { describe, expect, it } from "vitest";
import { BAYER_4, containRect, ditherThreshold, mosaicBlock, mosaicGridLines } from "@/features/reveal-image/effects";

describe("containRect", () => {
  it("ocupa a área inteira quando as proporções são iguais", () => {
    expect(containRect({ width: 1920, height: 1080 }, { width: 960, height: 540 })).toEqual({ dx: 0, dy: 0, dw: 960, dh: 540 });
  });

  it("numa área mais alta que a imagem, usa a largura toda e centraliza na altura", () => {
    expect(containRect({ width: 1600, height: 900 }, { width: 800, height: 800 })).toEqual({ dx: 0, dy: 175, dw: 800, dh: 450 });
  });

  it("numa área mais larga que a imagem, usa a altura toda e centraliza na largura", () => {
    expect(containRect({ width: 1600, height: 900 }, { width: 1000, height: 450 })).toEqual({ dx: 100, dy: 0, dw: 800, dh: 450 });
  });

  it("arredonda para pixels inteiros", () => {
    // 500 - 273 = 227 of band, 113.5 above: rounds to 114.
    expect(containRect({ width: 1919, height: 1049 }, { width: 500, height: 500 })).toEqual({ dx: 0, dy: 114, dw: 500, dh: 273 });
  });
});

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

describe("mosaicGridLines", () => {
  it("marca a divisa entre cada par de blocos", () => {
    expect(mosaicGridLines(256, 64)).toEqual([64, 128, 192]);
  });

  it("inclui a divisa do último bloco cortado pela borda", () => {
    expect(mosaicGridLines(150, 64)).toEqual([64, 128]);
  });

  it("não marca nada quando há um bloco só", () => {
    expect(mosaicGridLines(40, 64)).toEqual([]);
  });

  it("não marca nada na imagem nítida", () => {
    expect(mosaicGridLines(256, 1)).toEqual([]);
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
