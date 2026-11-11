import { describe, expect, it } from "vitest";
import { htmlLang } from "@/i18n/locale";
import { routing } from "@/i18n/routing";

describe("routing", () => {
  it("atende pt e en, com pt como padrão", () => {
    expect(routing.locales).toEqual(["pt", "en"]);
    expect(routing.defaultLocale).toBe("pt");
  });
});

describe("htmlLang", () => {
  it("converte pt para a tag do Brasil", () => {
    expect(htmlLang("pt")).toBe("pt-BR");
  });

  it("mantém en como está", () => {
    expect(htmlLang("en")).toBe("en");
  });
});
