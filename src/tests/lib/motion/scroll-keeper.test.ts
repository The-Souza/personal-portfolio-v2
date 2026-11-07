import { describe, expect, it } from "vitest";
import { placeAt, scrollForPlace } from "@/lib/motion/scroll-keeper";

const sections = [
  { id: "hero", top: 0, height: 800 },
  { id: "projects", top: 800, height: 6000 },
  { id: "contact", top: 6800, height: 1600 },
];

describe("placeAt", () => {
  it("guarda a seção atual e o quanto dela já passou", () => {
    expect(placeAt(sections, 6800 + 400)).toEqual({ id: "contact", progress: 0.25 });
  });

  it("conta o topo exato como início da seção", () => {
    expect(placeAt(sections, 800)).toEqual({ id: "projects", progress: 0 });
  });

  it("usa a primeira seção acima de todas", () => {
    expect(placeAt(sections, -20)).toEqual({ id: "hero", progress: 0 });
  });

  it("limita o progresso ao fim da última seção", () => {
    expect(placeAt(sections, 9000)).toEqual({ id: "contact", progress: 1 });
  });

  it("devolve null sem seções", () => {
    expect(placeAt([], 100)).toBeNull();
  });
});

describe("scrollForPlace", () => {
  it("volta ao mesmo ponto da seção com a nova altura", () => {
    const after = [
      { id: "hero", top: 0, height: 800 },
      { id: "projects", top: 800, height: 3000 },
      { id: "contact", top: 3800, height: 1200 },
    ];
    expect(scrollForPlace(after, { id: "contact", progress: 0.25 })).toBe(4100);
  });

  it("arredonda para pixels inteiros", () => {
    expect(scrollForPlace(sections, { id: "projects", progress: 1 / 3 })).toBe(2800);
  });

  it("devolve null quando a seção não existe mais", () => {
    expect(scrollForPlace(sections, { id: "stack", progress: 0.5 })).toBeNull();
  });
});
