import { beforeEach, describe, expect, it } from "vitest";
import {
  anchorAt,
  consumeScrollAnchor,
  hashSection,
  localeHref,
  saveScrollAnchor,
  scrollTargetFor,
  shouldRestoreScroll,
} from "@/features/header/locale-switch";

describe("hashSection", () => {
  const ids = ["hero", "about", "projects", "stack", "contact"];

  it("devolve a seção do hash", () => {
    expect(hashSection("#contact", ids)).toBe("contact");
  });

  it("devolve null sem hash ou com só o #", () => {
    expect(hashSection("", ids)).toBeNull();
    expect(hashSection("#", ids)).toBeNull();
  });

  it("devolve null para um hash que não é um ato da página", () => {
    expect(hashSection("#main", ids)).toBeNull();
  });

  it("decodifica o hash antes de comparar", () => {
    expect(hashSection("#%63ontact", ids)).toBe("contact");
  });

  it("não quebra com um hash malformado", () => {
    expect(hashSection("#%E0%A4%A", ids)).toBeNull();
  });
});

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

describe("anchorAt", () => {
  const tops = [
    { id: "hero", top: 0 },
    { id: "about", top: 800 },
    { id: "projects", top: 2400 },
    { id: "stack", top: 9200 },
  ];

  it("usa a última seção que começa antes da posição", () => {
    expect(anchorAt(tops, 12000)).toEqual({ section: "stack", offset: 2800 });
  });

  it("conta o topo exato como dentro da seção", () => {
    expect(anchorAt(tops, 2400)).toEqual({ section: "projects", offset: 0 });
  });

  it("usa a primeira seção no topo da página", () => {
    expect(anchorAt(tops, 0)).toEqual({ section: "hero", offset: 0 });
  });

  it("devolve null sem seções", () => {
    expect(anchorAt([], 500)).toBeNull();
  });
});

describe("shouldRestoreScroll", () => {
  it("restaura num reload", () => {
    expect(shouldRestoreScroll("reload", false)).toBe(true);
  });

  it("restaura ao voltar ou avançar no histórico", () => {
    expect(shouldRestoreScroll("back_forward", false)).toBe(true);
  });

  it("restaura depois de trocar de idioma", () => {
    expect(shouldRestoreScroll("navigate", true)).toBe(true);
  });

  it("não restaura numa navegação nova, que segue o hash do link", () => {
    expect(shouldRestoreScroll("navigate", false)).toBe(false);
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
