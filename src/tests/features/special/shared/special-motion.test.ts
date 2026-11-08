import { describe, expect, it } from "vitest";
import { aimReading, fillLine, isAimLineHidden, looseOffset } from "@/features/special/shared/special-motion";

describe("looseOffset", () => {
  it("segue o cursor a 14% da distância", () => {
    expect(looseOffset(100, -50)).toEqual({ x: 14, y: -7, rotation: 1.4, slot: 0.7 });
  });

  it("limita o deslocamento a 120 na horizontal e 90 na vertical", () => {
    const offset = looseOffset(5000, -5000);
    expect(offset.x).toBe(120);
    expect(offset.y).toBe(-90);
  });

  it("gira um décimo do deslocamento horizontal", () => {
    expect(looseOffset(-500, 0).rotation).toBe(-7);
  });

  it("mostra o encaixe por inteiro a partir de 30px de deslocamento", () => {
    expect(looseOffset(1000, 1000).slot).toBe(1);
  });

  it("fica no lugar com o cursor em cima do encaixe", () => {
    expect(looseOffset(0, 0)).toEqual({ x: 0, y: 0, rotation: 0, slot: 0 });
  });
});

describe("aimReading", () => {
  it("mostra as coordenadas com quatro dígitos e a distância até o encaixe", () => {
    expect(aimReading("alvo", 1000, 300, 736.4)).toBe("alvo · X 1000 Y 0300 · 736px");
  });

  it("arredonda as coordenadas", () => {
    expect(aimReading("target", 12.6, 7.2, 0.4)).toBe("target · X 0013 Y 0007 · 0px");
  });
});

describe("isAimLineHidden", () => {
  it("esconde a linha a menos de 30px do 0", () => {
    expect(isAimLineHidden(29)).toBe(true);
  });

  it("mostra a linha a partir de 30px", () => {
    expect(isAimLineHidden(30)).toBe(false);
  });
});

describe("fillLine", () => {
  it("troca os marcadores do texto pelos valores", () => {
    expect(fillLine({ prefix: ">", text: "get {path}" }, { path: "/pt/foo" })).toEqual({ prefix: ">", text: "get /pt/foo" });
  });

  it("troca também o rótulo e o estado", () => {
    expect(fillLine({ label: "{a}", text: "x", status: "{b}" }, { a: "1", b: "2" })).toEqual({ label: "1", text: "x", status: "2" });
  });

  it("deixa marcadores sem valor como estão", () => {
    expect(fillLine({ text: "digest: {digest}" }, {})).toEqual({ text: "digest: {digest}" });
  });
});
