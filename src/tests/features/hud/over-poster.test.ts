import { describe, expect, it } from "vitest";
import { anyCovers, coversBox, parseBladeClip } from "@/features/hud/over-poster";

describe("parseBladeClip", () => {
  it("sem recorte, o pôster cobre a largura toda", () => {
    expect(parseBladeClip("")).toBeNull();
  });

  it("lê o topo e a base do corte em porcentagem", () => {
    expect(parseBladeClip("polygon(80% 0, 100% 0, 100% 100%, 25% 100%)")).toEqual([80, 25]);
  });

  it("aceita valores negativos e decimais", () => {
    expect(parseBladeClip("polygon(-12.5% 0px, 100% 0px, 100% 100%, -67.5% 100%)")).toEqual([-12.5, -67.5]);
  });

  it("um recorte que não reconhece não cobre nada", () => {
    expect(parseBladeClip("inset(10px)")).toEqual([100, 100]);
  });
});

describe("coversBox", () => {
  // A poster that fills a 1000×900 screen.
  const poster = { left: 0, top: 0, width: 1000, height: 900 };
  // The act marks at the right edge, mid-screen; the reading at the bottom-right.
  const marks = { left: 920, top: 390, bottom: 510 };
  const reading = { left: 800, top: 870, bottom: 885 };

  it("sem recorte, cobre qualquer caixa dentro do pôster", () => {
    expect(coversBox({ ...poster, clip: null }, reading)).toBe(true);
  });

  it("com a lâmina já à esquerda do HUD, cobre (o recorte não importa mais ali)", () => {
    expect(coversBox({ ...poster, clip: [60, 5] }, marks)).toBe(true);
  });

  it("com a lâmina ainda à direita do HUD, não cobre", () => {
    expect(coversBox({ ...poster, clip: [140, 85] }, marks)).toBe(false);
  });

  it("não cobre quando a borda passa no meio da caixa", () => {
    // At y 390–510 the cut's left side runs from x≈962 to x≈888: the marks start at 920.
    expect(coversBox({ ...poster, clip: [120, 65] }, marks)).toBe(false);
  });

  it("não cobre uma caixa acima ou abaixo do pôster", () => {
    expect(coversBox({ ...poster, top: 500, clip: null }, marks)).toBe(false);
    expect(coversBox({ ...poster, top: -1000, clip: null }, marks)).toBe(false);
  });
});

describe("anyCovers", () => {
  const box = { left: 920, top: 390, bottom: 510 };
  const poster = { left: 0, top: -400, width: 1000, height: 800, clip: null };
  const footer = { left: 0, top: 400, width: 1000, height: 200, clip: null };

  it("cobre quando alguma superfície cobre a caixa inteira", () => {
    expect(anyCovers([{ ...poster, top: 300 }, footer], box)).toBe(true);
  });

  it("não cobre quando a caixa fica dividida entre duas superfícies", () => {
    expect(anyCovers([poster, footer], box)).toBe(false);
  });

  it("não cobre sem nenhuma superfície", () => {
    expect(anyCovers([], box)).toBe(false);
  });
});
