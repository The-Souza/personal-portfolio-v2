import { describe, expect, it } from "vitest";
import { SPRINGS, spring } from "@/lib/motion/spring";

function samples(ease: (p: number) => number, steps = 200) {
  return Array.from({ length: steps + 1 }, (_, i) => ease(i / steps));
}

describe("spring", () => {
  it("começa em 0 e termina em 1", () => {
    const { ease } = spring(170, 24);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });

  it("tem duração positiva e finita", () => {
    const { duration } = spring(170, 24);
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(5);
  });

  it("repousa perto de 1 no fim da duração", () => {
    const { ease } = spring(90, 26);
    expect(ease(0.999)).toBeCloseTo(1, 2);
  });

  it("trata progresso acima de 1 como o fim", () => {
    expect(spring(90, 26).ease(1.5)).toBe(1);
  });

  it("não passa de 1 com amortecimento alto", () => {
    expect(Math.max(...samples(spring(90, 26).ease))).toBeLessThanOrEqual(1);
  });

  it("passa de 1 antes de assentar com amortecimento baixo", () => {
    expect(Math.max(...samples(spring(120, 14).ease))).toBeGreaterThan(1);
  });

  it("demora mais com menos tensão", () => {
    expect(spring(70, 24).duration).toBeGreaterThan(spring(200, 24).duration);
  });
});

describe("SPRINGS", () => {
  it("tem as seis molas do briefing", () => {
    expect(Object.keys(SPRINGS).sort()).toEqual(["CLEAR", "FIGURE", "ITEM", "LOOSE", "REVEAL", "VEIL"]);
  });

  it("termina todas em 1", () => {
    for (const { ease } of Object.values(SPRINGS)) expect(ease(1)).toBe(1);
  });
});
