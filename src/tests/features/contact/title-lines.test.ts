import { describe, expect, it } from "vitest";
import { lineIndexes, lineOffsets } from "@/features/contact/title-lines";

describe("lineIndexes", () => {
  it("põe as palavras da mesma altura na mesma linha", () => {
    expect(lineIndexes([0, 0, 90, 90, 180])).toEqual([0, 0, 1, 1, 2]);
  });

  it("trata topos quase iguais como a mesma linha", () => {
    expect(lineIndexes([0, 0.6, 90, 89.7])).toEqual([0, 0, 1, 1]);
  });

  it("devolve uma lista vazia sem palavras", () => {
    expect(lineIndexes([])).toEqual([]);
  });
});

describe("lineOffsets", () => {
  const RIGHT = 0.2;
  const LEFT = 0.8;

  it("não desloca a primeira linha", () => {
    expect(lineOffsets([300], 500, 20, [RIGHT])).toEqual([0]);
  });

  it("anda um passo para o lado sorteado quando cabe", () => {
    expect(lineOffsets([300, 300, 300], 500, 20, [RIGHT, RIGHT, LEFT])).toEqual([0, 20, 0]);
  });

  it("inverte para a direita quando a esquerda passaria da margem", () => {
    expect(lineOffsets([300, 300], 500, 20, [RIGHT, LEFT])).toEqual([0, 20]);
  });

  it("inverte para a esquerda quando a direita passaria da largura", () => {
    expect(lineOffsets([300, 300, 485], 500, 20, [RIGHT, RIGHT, RIGHT])).toEqual([0, 20, 0]);
  });

  it("fica no limite quando não cabe em nenhum dos lados", () => {
    expect(lineOffsets([300, 495], 500, 20, [RIGHT, RIGHT])).toEqual([0, 5]);
  });

  it("não desloca uma linha mais larga que o espaço", () => {
    expect(lineOffsets([300, 520], 500, 20, [RIGHT, LEFT])).toEqual([0, 0]);
  });

  it("devolve uma lista vazia sem linhas", () => {
    expect(lineOffsets([], 500, 20, [])).toEqual([]);
  });
});
