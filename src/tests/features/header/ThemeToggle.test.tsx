import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/features/header/ThemeToggle";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
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

  it("salva a escolha", async () => {
    const user = userEvent.setup();
    renderToggle();
    await user.click(screen.getByRole("button"));
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
