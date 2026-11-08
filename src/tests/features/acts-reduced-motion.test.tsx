import { screen } from "@testing-library/react";
import { createTranslator } from "next-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AboutAct } from "@/features/about/AboutAct";
import { ContactAct } from "@/features/contact/ContactAct";
import { HeroAct } from "@/features/hero/HeroAct";
import { ProjectsAct } from "@/features/projects/ProjectsAct";
import { StackAct } from "@/features/stack/StackAct";
import { renderWithIntl } from "@/tests/helpers";
import messages from "../../../messages/pt.json";

const t = createTranslator({ locale: "pt", messages });

beforeAll(() => {
  // Reduced motion on: every act takes its static path.
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    // Not just "reduce": "prefers-reduced-motion: no-preference" contains it too.
    matches: query.includes("prefers-reduced-motion: reduce"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  const Observer = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  vi.stubGlobal("ResizeObserver", Observer);
  vi.stubGlobal("IntersectionObserver", Observer);
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
});

function renderActs() {
  return renderWithIntl(
    <main>
      <HeroAct />
      <AboutAct />
      <ProjectsAct />
      <StackAct />
      <ContactAct />
    </main>,
  );
}

describe("atos com movimento reduzido", () => {
  it("mostram o conteúdo de cada ato", () => {
    renderActs();
    expect(screen.getByText(t("hero.bio"))).toBeInTheDocument();
    expect(screen.getAllByText(t("about.title")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(t("projects.title")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(t("stack.title")).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: t("contact.title") })).toBeInTheDocument();
  });

  it("não deixam nada escondido pela animação", () => {
    const { container } = renderActs();
    const hidden = [...container.querySelectorAll<HTMLElement>("*")].filter(
      (el) => el.style.opacity === "0" || el.style.visibility === "hidden",
    );
    expect(hidden).toEqual([]);
  });

  it("deixam o pôster do Contato sem o corte da lâmina", () => {
    const { container } = renderActs();
    expect(container.querySelector<HTMLElement>("[data-contact-poster]")?.style.clipPath).toBe("");
  });
});
