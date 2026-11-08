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

  describe("último ato", () => {
    // The last act's middle line can't pass its end: below it there's only the footer.
    const boxes = [{ top: -3000, height: 2000 }, { top: -400, height: 1600 }];

    it("chega a 100 no fim da página, mesmo com a linha do meio antes do fim da seção", () => {
      expect(resolveActiveSection(boxes, VIEWPORT, 0)).toEqual({ index: 1, progress: 100 });
    });

    it("mede pelo que ainda dá para rolar", () => {
      // 800 of the act behind the line, 400 still to scroll: 800 of 1200.
      expect(resolveActiveSection(boxes, VIEWPORT, 400)).toEqual({ index: 1, progress: 67 });
    });

    it("usa a altura da seção quando ainda há mais para rolar do que ela mede", () => {
      expect(resolveActiveSection(boxes, VIEWPORT, 5000)).toEqual({ index: 1, progress: 50 });
    });

    it("não muda os atos antes do último", () => {
      const middle = [{ top: -400, height: 1600 }, { top: 2000, height: 1600 }];
      expect(resolveActiveSection(middle, VIEWPORT, 0)).toEqual({ index: 0, progress: 50 });
    });
  });
});
