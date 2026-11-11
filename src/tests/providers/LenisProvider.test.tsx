import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { useLenis } from "@/lib/scroll/lenis";
import { LenisProvider } from "@/providers/LenisProvider";
import { mockMediaQueries } from "@/tests/media-query";

const reduced = (on: boolean) => (query: string) => query.includes("reduce") && on;

function Page() {
  const lenis = useLenis();
  return (
    <>
      <a href="#about">about</a>
      <button type="button" onClick={() => lenis.stop()}>
        stop
      </button>
      <section id="about">about section</section>
    </>
  );
}

function renderPage() {
  return render(
    <LenisProvider>
      <Page />
    </LenisProvider>,
  );
}

const html = () => document.documentElement;

describe("LenisProvider", () => {
  beforeAll(() => {
    // Lenis watches the page size; jsdom has no ResizeObserver.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    html().className = "";
  });

  it("liga o Lenis sem movimento reduzido", () => {
    mockMediaQueries(reduced(false));
    renderPage();
    expect(html()).toHaveClass("lenis");
  });

  it("não liga o Lenis com movimento reduzido", () => {
    mockMediaQueries(reduced(true));
    renderPage();
    expect(html()).not.toHaveClass("lenis");
  });

  it("desliga o Lenis quando o movimento reduzido é ativado", () => {
    const media = mockMediaQueries(reduced(false));
    renderPage();
    act(() => media.change(reduced(true)));
    expect(html()).not.toHaveClass("lenis");
  });

  it("desliga o Lenis ao desmontar", () => {
    mockMediaQueries(reduced(false));
    renderPage().unmount();
    expect(html()).not.toHaveClass("lenis");
  });

  it("assume a rolagem das âncoras internas", () => {
    mockMediaQueries(reduced(false));
    renderPage();
    const click = fireEvent.click(screen.getByRole("link", { name: "about" }));
    expect(click).toBe(false);
  });

  it("deixa as âncoras com o navegador quando o Lenis está desligado", () => {
    mockMediaQueries(reduced(true));
    renderPage();
    const click = fireEvent.click(screen.getByRole("link", { name: "about" }));
    expect(click).toBe(true);
  });

  it("expõe stop para travar a rolagem", () => {
    mockMediaQueries(reduced(false));
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "stop" }));
    expect(html()).toHaveClass("lenis-stopped");
  });

  it("funciona fora do provider sem quebrar", () => {
    mockMediaQueries(reduced(false));
    render(<Page />);
    expect(() => fireEvent.click(screen.getByRole("button", { name: "stop" }))).not.toThrow();
  });

  it("aplica um stop pedido antes de o Lenis ligar", () => {
    mockMediaQueries(reduced(false));
    const page = render(<Page />);
    fireEvent.click(screen.getByRole("button", { name: "stop" }));
    page.unmount();

    renderPage();
    expect(html()).toHaveClass("lenis-stopped");
  });
});
