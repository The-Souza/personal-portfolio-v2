import { describe, expect, it } from "vitest";
import { resolveActiveSection } from "@/features/hud/active-section";

const VIEWPORT = 800;

describe("resolveActiveSection", () => {
  it("devolve a primeira seção sem progresso quando não há seções", () => {
    expect(resolveActiveSection([], VIEWPORT)).toEqual({ index: 0, progress: 0 });
  });

  it("fica na primeira seção antes de ela chegar ao meio da tela", () => {
    const boxes = [{ top: 500, height: 800 }, { top: 1300, height: 800 }];
    expect(resolveActiveSection(boxes, VIEWPORT)).toEqual({ index: 0, progress: 0 });
  });

  it("calcula o progresso pela linha do meio da tela", () => {
    const boxes = [{ top: 0, height: 800 }, { top: 800, height: 800 }];
    expect(resolveActiveSection(boxes, VIEWPORT)).toEqual({ index: 0, progress: 50 });
  });

  it("passa para a seção que cruzou o meio da tela", () => {
    const boxes = [{ top: -900, height: 800 }, { top: -100, height: 1000 }, { top: 900, height: 800 }];
    expect(resolveActiveSection(boxes, VIEWPORT)).toEqual({ index: 1, progress: 50 });
  });

  it("limita o progresso a 100 depois do fim da última seção", () => {
    const boxes = [{ top: -2000, height: 800 }];
    expect(resolveActiveSection(boxes, VIEWPORT)).toEqual({ index: 0, progress: 100 });
  });

  it("não divide por zero em uma seção sem altura", () => {
    expect(resolveActiveSection([{ top: 0, height: 0 }], VIEWPORT)).toEqual({ index: 0, progress: 100 });
  });
});
