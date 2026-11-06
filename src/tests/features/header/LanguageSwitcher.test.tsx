import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "@/features/header/LanguageSwitcher";
import { renderWithIntl } from "@/tests/helpers";

const stopNavigation = (event: Event) => event.preventDefault();

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.location.hash = "";
    document.addEventListener("click", stopNavigation);
  });

  afterEach(() => document.removeEventListener("click", stopNavigation));

  it("renderiza links comuns para funcionar sem JS", () => {
    renderWithIntl(<LanguageSwitcher />);
    expect(screen.getByRole("link", { name: "en" })).toHaveAttribute("href", "/en");
    expect(screen.getByRole("link", { name: "pt" })).toHaveAttribute("href", "/pt");
  });

  it("marca o idioma atual", () => {
    renderWithIntl(<LanguageSwitcher />);
    expect(screen.getByRole("link", { name: "pt" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "en" })).not.toHaveAttribute("aria-current");
  });

  it("mantém o hash ao trocar de idioma", () => {
    window.location.hash = "#projects";
    renderWithIntl(<LanguageSwitcher />);
    const link = screen.getByRole("link", { name: "en" });
    fireEvent.click(link);
    expect(link).toHaveAttribute("href", "/en#projects");
  });

  it("mostra a página de novo depois de restaurar a rolagem", async () => {
    document.documentElement.classList.add("locale-restoring");
    renderWithIntl(<LanguageSwitcher />);
    await waitFor(() => expect(document.documentElement).not.toHaveClass("locale-restoring"));
  });

  it("volta à mesma distância do topo da seção salva", async () => {
    sessionStorage.setItem("locale-switch-scroll", JSON.stringify({ section: "about", offset: 120 }));
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <>
        <section id="about" />
        <LanguageSwitcher />
      </>,
    );
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 120));
    scrollTo.mockRestore();
  });

  it("pede para a próxima página pular o boot", () => {
    renderWithIntl(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("link", { name: "en" }));
    expect(sessionStorage.getItem("boot-skip")).toBe("1");
  });

  it("salva a seção atual e a distância até o topo dela", () => {
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
