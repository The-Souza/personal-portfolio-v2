import { describe, expect, it } from "vitest";
import { collectEmptyKeys, collectKeys } from "@/i18n/message-keys";
import en from "../../../messages/en.json";
import pt from "../../../messages/pt.json";

describe("collectKeys", () => {
  it("devolve uma lista vazia para um objeto vazio", () => {
    expect(collectKeys({})).toEqual([]);
  });

  it("achata as chaves aninhadas com pontos, em ordem", () => {
    expect(collectKeys({ b: "x", a: { d: "y", c: { e: "z" } } })).toEqual(["a.c.e", "a.d", "b"]);
  });

  it("trata arrays como chaves indexadas", () => {
    expect(collectKeys({ a: ["x", { b: "y" }] })).toEqual(["a.0", "a.1.b"]);
  });
});

describe("collectEmptyKeys", () => {
  it("encontra textos em branco em qualquer nível", () => {
    expect(collectEmptyKeys({ a: "", b: { c: "  ", d: "ok" } })).toEqual(["a", "b.c"]);
  });
});

describe("mensagens", () => {
  it("têm as mesmas chaves em pt e en", () => {
    expect(collectKeys(en)).toEqual(collectKeys(pt));
  });

  it("não têm texto em branco em nenhum idioma", () => {
    expect(collectEmptyKeys(pt)).toEqual([]);
    expect(collectEmptyKeys(en)).toEqual([]);
  });
});
