import { beforeEach, describe, expect, it } from "vitest";
import { consumeScrollAnchor, localeHref, saveScrollAnchor, scrollTargetFor } from "@/features/header/locale-switch";

describe("localeHref", () => {
  it("aponta para a raiz do idioma sem hash", () => {
    expect(localeHref("en", "")).toBe("/en");
  });

  it("mantém o hash da seção", () => {
    expect(localeHref("en", "#projects")).toBe("/en#projects");
  });
});

describe("âncora de rolagem", () => {
  beforeEach(() => sessionStorage.clear());

  it("devolve a seção e a distância salvas", () => {
    saveScrollAnchor({ section: "projects", offset: 1200 });
    expect(consumeScrollAnchor()).toEqual({ section: "projects", offset: 1200 });
  });

  it("devolve a âncora só uma vez", () => {
    saveScrollAnchor({ section: "about", offset: 40 });
    consumeScrollAnchor();
    expect(consumeScrollAnchor()).toBeNull();
  });

  it("devolve null sem âncora salva", () => {
    expect(consumeScrollAnchor()).toBeNull();
  });

  it("ignora um valor inválido", () => {
    sessionStorage.setItem("locale-switch-scroll", "abc");
    expect(consumeScrollAnchor()).toBeNull();
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: "x" }));
    expect(consumeScrollAnchor()).toBeNull();
  });
});

describe("scrollTargetFor", () => {
  it("soma a distância ao topo atual da seção", () => {
    expect(scrollTargetFor({ section: "stack", offset: 300 }, 5000)).toBe(5300);
  });

  it("nunca devolve uma posição negativa", () => {
    expect(scrollTargetFor({ section: "hero", offset: -50 }, 0)).toBe(0);
  });
});
