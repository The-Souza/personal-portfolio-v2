import { beforeEach, describe, expect, it } from "vitest";
import { consumeScrollPosition, localeHref, saveScrollPosition } from "@/features/header/locale-switch";

describe("localeHref", () => {
  it("aponta para a raiz do idioma sem hash", () => {
    expect(localeHref("en", "")).toBe("/en");
  });

  it("mantém o hash da seção", () => {
    expect(localeHref("en", "#projects")).toBe("/en#projects");
  });
});

describe("posição de rolagem", () => {
  beforeEach(() => sessionStorage.clear());

  it("devolve a posição salva", () => {
    saveScrollPosition(1234);
    expect(consumeScrollPosition()).toBe(1234);
  });

  it("devolve a posição só uma vez", () => {
    saveScrollPosition(1234);
    consumeScrollPosition();
    expect(consumeScrollPosition()).toBeNull();
  });

  it("devolve null sem posição salva", () => {
    expect(consumeScrollPosition()).toBeNull();
  });

  it("ignora um valor inválido", () => {
    sessionStorage.setItem("locale-switch-scroll", "abc");
    expect(consumeScrollPosition()).toBeNull();
  });
});
