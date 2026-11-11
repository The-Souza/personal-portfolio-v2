import { describe, expect, it } from "vitest";
import { resolveActVariant } from "@/lib/motion/breakpoints";

const viewport = (width: number, height: number, reducedMotion = false) => ({ width, height, reducedMotion });

describe("resolveActVariant", () => {
  it.each([
    ["desktop", 1440, 900, "full"],
    ["tablet deitado", 1180, 820, "full"],
    ["tablet em pé", 820, 1180, "full"],
    ["limite do tablet", 720, 1000, "full"],
    ["celular em pé", 390, 844, "narrow"],
    ["logo abaixo do tablet", 719, 1000, "narrow"],
    ["celular deitado", 844, 390, "short"],
    ["limite da tela baixa", 1440, 599, "short"],
    ["altura mínima", 1440, 600, "full"],
  ])("%s (%i×%i) usa %s", (_name, width, height, expected) => {
    expect(resolveActVariant(viewport(width, height))).toBe(expected);
  });

  it("prefere a tela baixa à estreita", () => {
    expect(resolveActVariant(viewport(500, 400))).toBe("short");
  });

  it("usa a versão estática com movimento reduzido, em qualquer tela", () => {
    expect(resolveActVariant(viewport(1440, 900, true))).toBe("static");
    expect(resolveActVariant(viewport(390, 844, true))).toBe("static");
    expect(resolveActVariant(viewport(844, 390, true))).toBe("static");
  });
});
