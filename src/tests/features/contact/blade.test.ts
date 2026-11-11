import { describe, expect, it } from "vitest";
import { BLADE, bladeAt, bladeClip, isBladeDone, isTitleReady } from "@/features/contact/blade";

describe("bladeAt", () => {
  it("começa com a lâmina fora da tela, à direita", () => {
    expect(bladeAt(0)).toBe(BLADE.from);
  });

  it("termina com a lâmina além da borda esquerda", () => {
    expect(bladeAt(1)).toBeCloseTo(BLADE.to);
  });

  it("anda em linha reta com o progresso", () => {
    expect(bladeAt(0.5)).toBeCloseTo((BLADE.from + BLADE.to) / 2);
  });

  it("limita progressos fora de 0 a 1", () => {
    expect(bladeAt(-1)).toBe(BLADE.from);
    expect(bladeAt(2)).toBeCloseTo(BLADE.to);
  });
});

describe("bladeClip", () => {
  it("corta a 45° com a base 55% atrás do topo", () => {
    expect(bladeClip(1)).toBe("polygon(100% 0, 100% 0, 100% 100%, 45% 100%)");
  });

  it("cobre a tela inteira no fim do percurso", () => {
    expect(bladeClip(-0.12)).toBe("polygon(-12% 0, 100% 0, 100% 100%, -67% 100%)");
  });

  it("desloca o fio da lâmina para a esquerda", () => {
    expect(bladeClip(1, BLADE.edge)).toBe("polygon(98.6% 0, 100% 0, 100% 100%, 43.6% 100%)");
  });

  it("não deixa ruído de ponto flutuante no polígono", () => {
    expect(bladeClip(1.6)).toBe("polygon(160% 0, 100% 0, 100% 100%, 105% 100%)");
  });
});

describe("isBladeDone", () => {
  it("termina quando o topo do corte passa da borda esquerda e o pôster cobre o palco", () => {
    expect(isBladeDone(0)).toBe(true);
    expect(isBladeDone(-0.1183)).toBe(true);
    expect(isBladeDone(bladeAt(1))).toBe(true);
  });

  it("não termina enquanto ainda há palco descoberto", () => {
    expect(isBladeDone(0.01)).toBe(false);
    expect(isBladeDone(BLADE.from)).toBe(false);
  });
});

describe("isTitleReady", () => {
  it("libera o título quando a lâmina passa da metade", () => {
    expect(isTitleReady(0.49)).toBe(true);
  });

  it("segura o título antes disso", () => {
    expect(isTitleReady(0.5)).toBe(false);
    expect(isTitleReady(1.6)).toBe(false);
  });
});
