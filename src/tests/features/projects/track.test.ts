import { describe, expect, it } from "vitest";
import { closestToCenter, counterLabel, ghostOffset, trackStops } from "@/features/projects/track";

const VW = 1000;

describe("trackStops", () => {
  const cards = [
    { left: 80, width: 800 },
    { left: 930, width: 800 },
    { left: 1780, width: 800 },
  ];
  // The track is 2660px wide, so it can move at most 1660px to the left.
  const maxShift = 1660;

  it("centraliza cada card na tela", () => {
    expect(trackStops(cards, VW, maxShift)[1]).toBe(-830);
  });

  it("não puxa o trilho para a direita além do início", () => {
    expect(trackStops(cards, VW, maxShift)[0]).toBe(0);
  });

  it("não passa do fim do trilho", () => {
    expect(trackStops(cards, VW, maxShift)[2]).toBe(-1660);
  });
});

describe("closestToCenter", () => {
  const cards = [
    { left: 80, width: 800 },
    { left: 930, width: 800 },
  ];

  it("escolhe o card mais perto do centro da tela", () => {
    expect(closestToCenter(cards, 0, VW)).toEqual({ index: 0, distance: 20 });
    expect(closestToCenter(cards, -830, VW)).toEqual({ index: 1, distance: 0 });
  });

  it("devolve -1 sem cards", () => {
    expect(closestToCenter([], 0, VW).index).toBe(-1);
  });
});

describe("counterLabel", () => {
  it("mostra a posição com dois dígitos", () => {
    expect(counterLabel(2, 6)).toBe("03 / 06");
  });
});

describe("ghostOffset", () => {
  it("assenta na diagonal no desktop e no tablet", () => {
    expect(ghostOffset(false)).toEqual({ x: -44, y: -36 });
  });

  it("sobe na vertical na lista, para não sair da tela", () => {
    expect(ghostOffset(true)).toEqual({ x: 0, y: -48 });
  });
});
