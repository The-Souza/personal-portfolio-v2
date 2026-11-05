import { describe, expect, it } from "vitest";
import { formatReadout, isArmDot, revealRadius, toGridPoint } from "@/features/hero/hero-grid";

describe("toGridPoint", () => {
  const rect = { left: 100, top: 50, width: 800, height: 400 };

  it("converte a posição da tela para a malha sem escala", () => {
    expect(toGridPoint(500, 250, rect, 800, 400)).toEqual({ x: 400, y: 200 });
  });

  it("desfaz a escala quando o hero está encolhido", () => {
    const scaled = { left: 140, top: 70, width: 720, height: 360 };
    expect(toGridPoint(500, 250, scaled, 800, 400)).toEqual({ x: 400, y: 200 });
  });

  it("não divide por zero num canvas sem tamanho", () => {
    expect(toGridPoint(500, 250, { left: 0, top: 0, width: 0, height: 0 }, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("formatReadout", () => {
  it("mostra as coordenadas com quatro dígitos", () => {
    expect(formatReadout(342, 151)).toBe("X 0342 · Y 0151");
  });

  it("arredonda as coordenadas", () => {
    expect(formatReadout(9.6, 1234.2)).toBe("X 0010 · Y 1234");
  });
});

describe("isArmDot", () => {
  const cursor = { column: 10, row: 5, x: 168, y: 88 };

  it("marca os pontos da coluna do cursor até 180px", () => {
    expect(isArmDot({ column: 10, row: 12, x: 168, y: 200 }, cursor)).toBe(true);
    expect(isArmDot({ column: 10, row: 30, x: 168, y: 488 }, cursor)).toBe(false);
  });

  it("marca os pontos da linha do cursor até 180px", () => {
    expect(isArmDot({ column: 14, row: 5, x: 232, y: 88 }, cursor)).toBe(true);
    expect(isArmDot({ column: 40, row: 5, x: 648, y: 88 }, cursor)).toBe(false);
  });

  it("ignora pontos fora da linha e da coluna", () => {
    expect(isArmDot({ column: 11, row: 6, x: 184, y: 104 }, cursor)).toBe(false);
  });
});

describe("revealRadius", () => {
  it("vai do centro até o canto da malha", () => {
    expect(revealRadius(600, 800, 0)).toBe(0);
    expect(revealRadius(600, 800, 1)).toBe(500);
    expect(revealRadius(600, 800, 0.5)).toBe(250);
  });
});
