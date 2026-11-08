import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { SiteHeader } from "@/features/header/SiteHeader";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { mockMediaQueries } from "@/tests/media-query";
import messages from "../../../../messages/pt.json";

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ThemeProvider>
        <SiteHeader />
      </ThemeProvider>
    </NextIntlClientProvider>,
  );
}

const menuButton = () => screen.getByRole("button", { name: "Menu" });
const dialog = () => screen.getByRole("dialog");
/** The panel leaves the DOM once its 0.3s close animation ends. */
const waitForClosed = () => waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

async function openDrawer() {
  const user = userEvent.setup();
  renderHeader();
  await user.click(menuButton());
  return user;
}

describe("Drawer", () => {
  afterEach(() => {
    document.documentElement.style.overflow = "";
  });

  it("começa fechado, com o botão ligado ao painel", () => {
    renderHeader();
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(menuButton()).toHaveAttribute("aria-controls", "site-drawer");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre, marca aria-expanded e trava a rolagem", async () => {
    await openDrawer();
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(dialog()).toBeVisible();
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("lista as cinco seções numeradas", async () => {
    await openDrawer();
    const links = within(dialog()).getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("#"));
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#hero", "#about", "#projects", "#stack", "#contact"]);
    expect(links[0]).toHaveTextContent("01");
    expect(links[4]).toHaveTextContent("05");
  });

  it("marca a seção atual com aria-current", async () => {
    await openDrawer();
    expect(within(dialog()).getByRole("link", { name: /Início/ })).toHaveAttribute("aria-current", "true");
    expect(within(dialog()).getByRole("link", { name: /Sobre/ })).toHaveAttribute("aria-current", "false");
  });

  it("leva o foco para dentro ao abrir", async () => {
    await openDrawer();
    expect(dialog()).toContainElement(document.activeElement as HTMLElement);
  });

  it("fecha com Esc e devolve o foco ao botão Menu", async () => {
    const user = await openDrawer();
    await user.keyboard("{Escape}");
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(menuButton()).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
    await waitForClosed();
  });

  it("mantém o painel na tela enquanto a animação de fechar roda", async () => {
    const user = await openDrawer();
    await user.keyboard("{Escape}");
    expect(menuButton()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await waitForClosed();
  });

  it("fecha pelo botão Fechar", async () => {
    const user = await openDrawer();
    await user.click(within(dialog()).getByRole("button", { name: "Fechar" }));
    expect(menuButton()).toHaveFocus();
    await waitForClosed();
  });

  it("fecha ao clicar no fundo", async () => {
    const user = await openDrawer();
    await user.click(screen.getByTestId("drawer-overlay"));
    await waitForClosed();
  });

  it("fecha ao clicar num item, sem devolver o foco ao botão", async () => {
    const user = await openDrawer();
    await user.click(within(dialog()).getByRole("link", { name: /Sobre/ }));
    expect(menuButton()).not.toHaveFocus();
    await waitForClosed();
  });

  it("prende o foco: Tab no último volta ao primeiro", async () => {
    const user = await openDrawer();
    const focusable = dialog().querySelectorAll<HTMLElement>("a[href], button");
    focusable[focusable.length - 1].focus();
    await user.tab();
    expect(focusable[0]).toHaveFocus();
  });

  it("prende o foco: Shift+Tab no primeiro vai ao último", async () => {
    const user = await openDrawer();
    const focusable = dialog().querySelectorAll<HTMLElement>("a[href], button");
    focusable[0].focus();
    await user.tab({ shift: true });
    expect(focusable[focusable.length - 1]).toHaveFocus();
  });

  it("fecha sozinho quando a largura chega a 1024", async () => {
    await openDrawer();
    const width = window.innerWidth;
    window.innerWidth = 1024;
    fireEvent(window, new Event("resize"));
    await waitForClosed();
    window.innerWidth = width;
  });

  it("continua aberto abaixo de 1024", async () => {
    await openDrawer();
    const width = window.innerWidth;
    window.innerWidth = 800;
    fireEvent(window, new Event("resize"));
    expect(dialog()).toBeVisible();
    window.innerWidth = width;
  });

  // Last on purpose: the reduced-motion matchMedia stays mocked for the rest of the file.
  it("fecha na hora com movimento reduzido", async () => {
    mockMediaQueries((query) => query.includes("reduce"));
    const user = await openDrawer();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
