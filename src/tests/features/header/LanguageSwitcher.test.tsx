import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("mostra a página de novo depois de restaurar a rolagem", () => {
    document.documentElement.classList.add("locale-restoring");
    renderWithIntl(<LanguageSwitcher />);
    expect(document.documentElement).not.toHaveClass("locale-restoring");
  });

  it("pede para a próxima página pular o boot", () => {
    renderWithIntl(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("link", { name: "en" }));
    expect(sessionStorage.getItem("boot-skip")).toBe("1");
  });

  it("salva a posição de rolagem ao trocar de idioma", () => {
    window.scrollY = 640;
    renderWithIntl(<LanguageSwitcher />);
    fireEvent.click(screen.getByRole("link", { name: "en" }));
    expect(sessionStorage.getItem("locale-switch-scroll")).toBe("640");
    window.scrollY = 0;
  });
});
