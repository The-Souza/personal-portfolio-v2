import { describe, expect, it } from "vitest";
import { anyCovers, coversPoint } from "@/features/hud/over-poster";

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

describe("anyCovers", () => {
  const poster = { top: -400, bottom: 500, clipped: false };
  const footer = { top: 500, bottom: 900, clipped: false };

  it("cobre quando o ponto está sobre o rodapé, depois do pôster", () => {
    expect(anyCovers([poster, footer], 884)).toBe(true);
  });

  it("cobre quando o ponto está sobre o pôster", () => {
    expect(anyCovers([poster, footer], 200)).toBe(true);
  });

  it("não cobre com o pôster ainda recortado pela lâmina e o rodapé fora do ponto", () => {
    expect(anyCovers([{ ...poster, clipped: true }, footer], 200)).toBe(false);
  });

  it("não cobre sem nenhuma superfície", () => {
    expect(anyCovers([], 450)).toBe(false);
  });
});
