import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const stopNavigation = (event: Event) => event.preventDefault();

// The switcher reads the saved anchor once per page load (module state), so each test loads a
// fresh copy, together with the helpers and the page-ready signal it talks to.
async function load() {
  vi.resetModules();
  const { LanguageSwitcher } = await import("@/features/header/LanguageSwitcher");
  const { markPageReady } = await import("@/lib/scroll/page-ready");
  const { renderWithIntl } = await import("@/tests/helpers");
  return { LanguageSwitcher, markPageReady, renderWithIntl };
}

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.location.hash = "";
    document.addEventListener("click", stopNavigation);
  });

  afterEach(() => {
    document.removeEventListener("click", stopNavigation);
    document.documentElement.classList.remove("boot-skip", "locale-restoring");
    vi.restoreAllMocks();
  });

  it("renderiza links comuns para funcionar sem JS", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    renderWithIntl(<LanguageSwitcher />);
    expect(screen.getByRole("link", { name: "en" })).toHaveAttribute("href", "/en");
    expect(screen.getByRole("link", { name: "pt" })).toHaveAttribute("href", "/pt");
  });

  it("marca o idioma atual", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    renderWithIntl(<LanguageSwitcher />);
    expect(screen.getByRole("link", { name: "pt" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "en" })).not.toHaveAttribute("aria-current");
  });

  it("mantém o hash ao trocar de idioma", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    window.location.hash = "#projects";
    renderWithIntl(<LanguageSwitcher />);
    const link = screen.getByRole("link", { name: "en" });
    fireEvent.click(link);
    expect(link).toHaveAttribute("href", "/en#projects");
  });

  it("mostra a página de novo quando não há rolagem para restaurar", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    document.documentElement.classList.add("locale-restoring");
    renderWithIntl(<LanguageSwitcher />);
    await waitFor(() => expect(document.documentElement).not.toHaveClass("locale-restoring"));
  });

  it("volta à mesma distância do topo da seção salva depois de trocar de idioma", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    document.documentElement.classList.add("boot-skip");
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: 120 }));
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <>
        <section id="about" />
        <LanguageSwitcher />
      </>,
    );
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 120));
  });

  it("mantém a página oculta até os atos montarem e restaura de novo", async () => {
    const { LanguageSwitcher, markPageReady, renderWithIntl } = await load();
    document.documentElement.classList.add("boot-skip", "locale-restoring");
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: 120 }));
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <>
        <section id="about" />
        <LanguageSwitcher />
      </>,
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.documentElement).toHaveClass("locale-restoring");
    scrollTo.mockClear();
    act(() => markPageReady());
    expect(scrollTo).toHaveBeenCalledWith(0, 120);
    expect(document.documentElement).not.toHaveClass("locale-restoring");
  });

  it("não mostra a página antes da hora quando há dois seletores", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    document.documentElement.classList.add("boot-skip", "locale-restoring");
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: 120 }));
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <>
        <section id="about" />
        <LanguageSwitcher />
        <LanguageSwitcher />
      </>,
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.documentElement).toHaveClass("locale-restoring");
  });

  it("volta à seção salva num reload", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: 300 }));
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([{ type: "reload" } as PerformanceNavigationTiming]);
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <>
        <section id="about" />
        <LanguageSwitcher />
      </>,
    );
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 300));
  });

  it("não restaura a rolagem numa navegação nova", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: 300 }));
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <>
        <section id="about" />
        <LanguageSwitcher />
      </>,
    );
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("salva a seção atual ao sair da página", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    renderWithIntl(
      <>
        <section id="hero" />
        <LanguageSwitcher />
      </>,
    );
    window.dispatchEvent(new Event("pagehide"));
    expect(JSON.parse(sessionStorage.getItem("locale-switch-scroll") ?? "null")).toEqual({ section: "hero", offset: 0 });
  });

  it("pede para a próxima página pular o boot", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    renderWithIntl(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("link", { name: "en" }));
    expect(sessionStorage.getItem("boot-skip")).toBe("1");
  });

  it("salva a seção atual e a distância até o topo dela", async () => {
    const { LanguageSwitcher, renderWithIntl } = await load();
    renderWithIntl(
      <>
        <section id="hero" />
        <LanguageSwitcher />
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: "en" }));
    expect(JSON.parse(sessionStorage.getItem("locale-switch-scroll") ?? "null")).toEqual({ section: "hero", offset: 0 });
  });
});
