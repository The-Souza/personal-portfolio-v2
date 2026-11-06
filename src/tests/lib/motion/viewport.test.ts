import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { holdPageHeight } from "@/lib/motion/viewport";

describe("holdPageHeight", () => {
  const root = document.documentElement;
  let releases: (() => void)[] = [];
  const hold = () => {
    const release = holdPageHeight();
    releases.push(release);
    return release;
  };

  beforeEach(() => {
    vi.spyOn(root, "scrollHeight", "get").mockReturnValue(9000);
  });

  afterEach(() => {
    for (const release of releases) release();
    releases = [];
    root.style.minHeight = "";
    vi.restoreAllMocks();
  });

  it("fixa a altura mínima da página na altura atual", () => {
    hold();
    expect(root.style.minHeight).toBe("9000px");
  });

  it("devolve a altura mínima anterior ao liberar", () => {
    root.style.minHeight = "50vh";
    hold()();
    expect(root.style.minHeight).toBe("50vh");
  });

  it("remove a altura mínima ao liberar quando não havia nenhuma", () => {
    hold()();
    expect(root.style.minHeight).toBe("");
  });

  it("mantém a altura até a última trava ser liberada", () => {
    const first = hold();
    const second = hold();
    first();
    expect(root.style.minHeight).toBe("9000px");
    second();
    expect(root.style.minHeight).toBe("");
  });

  it("libera na ordem inversa sem deixar altura presa", () => {
    const first = hold();
    const second = hold();
    second();
    first();
    expect(root.style.minHeight).toBe("");
  });

  it("ignora liberar a mesma trava duas vezes", () => {
    const first = hold();
    hold();
    first();
    first();
    expect(root.style.minHeight).toBe("9000px");
  });
});
