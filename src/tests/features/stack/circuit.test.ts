import { describe, expect, it } from "vitest";
import { circuitPoints, circuitSpacing, cumulativeLengths } from "@/features/stack/circuit";

describe("circuitPoints", () => {
  it("monta a escada: direita, desce, direita, desce…", () => {
    expect(circuitPoints(5, { sx: 100, sy: 50 })).toEqual([
      [300, 300],
      [400, 300],
      [400, 350],
      [500, 350],
      [500, 400],
    ]);
  });

  it("começa na margem M de 300px", () => {
    expect(circuitPoints(1, { sx: 100, sy: 50 })).toEqual([[300, 300]]);
  });
});

describe("circuitSpacing", () => {
  const viewport = { width: 1440, height: 900 };

  it("usa as fórmulas do briefing no circuito normal", () => {
    // SX = max(min(0.62·vw, 820), NW + max(160, 0.22·vw)); SY = max(0.7·vh, NH + 200); FY = 0.56·vh
    const spacing = circuitSpacing(viewport, { width: 480, height: 300 }, false);
    expect(spacing.sx).toBe(820);
    expect(spacing.sy).toBeCloseTo(630);
    expect(spacing.fy).toBeCloseTo(504);
  });

  it("afasta mais os degraus quando o card é largo", () => {
    expect(circuitSpacing(viewport, { width: 600, height: 300 }, false).sx).toBeCloseTo(916.8);
  });

  it("dá espaço ao card mais alto", () => {
    expect(circuitSpacing(viewport, { width: 480, height: 600 }, false).sy).toBe(800);
  });

  it("usa os degraus curtos no circuito compacto", () => {
    // SX = NW + max(120, 0.18·vw); SY = NH + 120; FY = 56 + (vh − 56) / 2
    const spacing = circuitSpacing({ width: 852, height: 393 }, { width: 460, height: 200 }, true);
    expect(spacing.sx).toBeCloseTo(613.36);
    expect(spacing.sy).toBe(320);
    expect(spacing.fy).toBeCloseTo(224.5);
  });
});

describe("cumulativeLengths", () => {
  it("soma o comprimento do caminho até cada ponto", () => {
    expect(cumulativeLengths([[0, 0], [3, 4], [3, 10]])).toEqual([0, 5, 11]);
  });

  it("devolve zero para um ponto só", () => {
    expect(cumulativeLengths([[1, 1]])).toEqual([0]);
  });
});
