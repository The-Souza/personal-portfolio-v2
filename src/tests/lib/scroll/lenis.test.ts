import type Lenis from "lenis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectLenis } from "@/lib/scroll/lenis";

describe("links internos com o Lenis", () => {
  let disconnect: () => void;
  const scrollTo = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = `
      <a id="skip" href="#main">Pular</a>
      <a id="about-link" href="#about">Sobre</a>
      <main id="main" tabindex="-1"><section id="about"></section></main>`;
    disconnect = connectLenis({ scrollTo, stop: vi.fn(), start: vi.fn() } as unknown as Lenis);
  });

  afterEach(() => {
    disconnect();
    scrollTo.mockReset();
    document.body.innerHTML = "";
  });

  it("rola até o destino com o Lenis em vez de deixar o navegador pular", () => {
    document.getElementById("about-link")?.click();
    expect(scrollTo).toHaveBeenCalledWith(document.getElementById("about"));
  });

  it("leva o foco ao destino que aceita foco, como o pular para o conteúdo", () => {
    document.getElementById("skip")?.click();
    expect(document.activeElement).toBe(document.getElementById("main"));
  });

  it("não tira o foco do link quando o destino não aceita foco", () => {
    const link = document.getElementById("about-link") as HTMLAnchorElement;
    link.focus();
    link.click();
    expect(document.activeElement).toBe(link);
  });
});
