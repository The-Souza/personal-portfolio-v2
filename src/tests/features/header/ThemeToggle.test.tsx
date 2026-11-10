import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/features/header/ThemeToggle";
import { ThemeProvider } from "@/providers/ThemeProvider";
import en from "../../../../messages/en.json";
import messages from "../../../../messages/pt.json";

function renderToggle() {
  return render(
    <NextIntlClientProvider locale="pt" messages={messages}>
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    </NextIntlClientProvider>,
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("troca de Noite para Dia e de volta pela classe", async () => {
    const user = userEvent.setup();
    renderToggle();
    const toggle = screen.getByRole("button");
    expect(document.documentElement).toHaveClass("dark");

    await user.click(toggle);
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(toggle);
    expect(document.documentElement).toHaveClass("dark");
  });

  it.each([
    ["pt", messages],
    ["en", en],
  ])("em %s, o nome de cada estado começa pela palavra visível nele (WCAG 2.5.3)", (_locale, { header }) => {
    // In Day the button shows "Dia" and offers Night; in Night it shows "Noite" and offers Day.
    expect(header.theme.toNight.startsWith(header.theme.day)).toBe(true);
    expect(header.theme.toDay.startsWith(header.theme.night)).toBe(true);
  });

  it("salva a escolha", async () => {
    const user = userEvent.setup();
    renderToggle();
    await user.click(screen.getByRole("button"));
    expect(localStorage.getItem("theme")).toBe("light");
  });

  describe("transição", () => {
    afterEach(() => {
      Reflect.deleteProperty(document, "startViewTransition");
      vi.mocked(window.matchMedia).mockImplementation(defaultMatchMedia);
    });

    const defaultMatchMedia = vi.mocked(window.matchMedia).getMockImplementation()!;

    const stubTransition = () => {
      const classDuringUpdate: boolean[] = [];
      const startViewTransition = vi.fn((update: () => void) => {
        update();
        classDuringUpdate.push(document.documentElement.classList.contains("dark"));
        return { finished: Promise.resolve() };
      });
      Object.defineProperty(document, "startViewTransition", { configurable: true, value: startViewTransition });
      return { startViewTransition, classDuringUpdate };
    };

    it("troca o tema dentro de uma View Transition, já com a classe nova no callback", async () => {
      const user = userEvent.setup();
      const { startViewTransition, classDuringUpdate } = stubTransition();
      renderToggle();
      await user.click(screen.getByRole("button"));
      expect(startViewTransition).toHaveBeenCalledOnce();
      expect(classDuringUpdate).toEqual([false]);
    });

    it("troca direto com movimento reduzido", async () => {
      const user = userEvent.setup();
      const { startViewTransition } = stubTransition();
      vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
        ...defaultMatchMedia(query),
        matches: query.includes("reduce"),
      }));
      renderToggle();
      await user.click(screen.getByRole("button"));
      expect(startViewTransition).not.toHaveBeenCalled();
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("troca direto sem suporte a View Transitions", async () => {
      const user = userEvent.setup();
      renderToggle();
      await user.click(screen.getByRole("button"));
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });
});
