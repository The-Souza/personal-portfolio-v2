import { describe, expect, it } from "vitest";
import { glitchJitter, glitchSlice, nextGlitchDelay } from "@/lib/motion/glitch";

const fixed = (value: number) => () => value;

describe("glitchSlice", () => {
  it.each([0, 0.5, 0.999])("mantém a fatia dentro do texto (aleatório %s)", (value) => {
    const { top, bottom } = glitchSlice(1, 1, fixed(value));
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThanOrEqual(85);
    expect(bottom).toBeGreaterThanOrEqual(0);
    expect(top + bottom).toBeLessThan(100);
  });

  it("desloca de 3 a 15px na direção pedida", () => {
    expect(glitchSlice(1, 1, fixed(0)).x).toBe(3);
    expect(glitchSlice(-1, 1, fixed(0.999)).x).toBeCloseTo(-15, 1);
  });

  it("escala o deslocamento pela intensidade", () => {
    expect(glitchSlice(1, 2, fixed(0)).x).toBe(6);
  });
});

describe("glitchJitter", () => {
  it.each([0, 0.5, 0.999])("treme até ±3px e ±5° (aleatório %s)", (value) => {
    const { x, skewX } = glitchJitter(1, fixed(value));
    expect(Math.abs(x)).toBeLessThanOrEqual(3);
    expect(Math.abs(skewX)).toBeLessThanOrEqual(5);
  });
});

describe("nextGlitchDelay", () => {
  it("espera de 6 a 11 segundos", () => {
    expect(nextGlitchDelay(fixed(0))).toBe(6000);
    expect(nextGlitchDelay(fixed(1))).toBe(11000);
  });
});
