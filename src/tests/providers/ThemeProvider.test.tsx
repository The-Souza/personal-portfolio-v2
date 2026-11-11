import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "@/providers/ThemeProvider";

function Switch() {
  const { setTheme } = useTheme();
  return (
    <>
      <button onClick={() => setTheme("light")}>day</button>
      <button onClick={() => setTheme("dark")}>night</button>
    </>
  );
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Switch />
    </ThemeProvider>,
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  // The matchMedia stub reports no dark preference, so this also covers a light system.
  it("começa no tema Noite, mesmo com o sistema em tema claro", () => {
    renderProvider();
    expect(document.documentElement).toHaveClass("dark");
  });

  it("troca para Dia e volta para Noite pela classe", async () => {
    const user = userEvent.setup();
    renderProvider();

    await user.click(screen.getByRole("button", { name: "day" }));
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(screen.getByRole("button", { name: "night" }));
    expect(document.documentElement).toHaveClass("dark");
  });

  it("restaura a escolha salva", () => {
    localStorage.setItem("theme", "light");
    renderProvider();
    expect(document.documentElement).not.toHaveClass("dark");
  });
});
