import { describe, expect, it } from "vitest";
import { coversPoint } from "@/features/hud/over-poster";

describe("coversPoint", () => {
  const poster = { top: 0, bottom: 900 };

  it("cobre um ponto dentro do pôster já pronto", () => {
    expect(coversPoint(poster, 450, false)).toBe(true);
  });

  it("não cobre enquanto a lâmina ainda recorta o pôster", () => {
    expect(coversPoint(poster, 450, true)).toBe(false);
  });

  it("não cobre um ponto acima ou abaixo do pôster", () => {
    expect(coversPoint({ top: 500, bottom: 1400 }, 450, false)).toBe(false);
    expect(coversPoint({ top: -1200, bottom: 300 }, 450, false)).toBe(false);
  });

  it("cobre o ponto exatamente na borda", () => {
    expect(coversPoint({ top: 450, bottom: 1000 }, 450, false)).toBe(true);
  });
});
