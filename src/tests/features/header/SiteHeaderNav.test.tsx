import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/features/header/SiteHeader";
import { ThemeProvider } from "@/providers/ThemeProvider";
import messages from "../../../../messages/pt.json";

// Act 03 (projects) on screen.
vi.mock("@/features/hud/use-active-section", () => ({ useActiveSection: () => ({ index: 2, progress: 40 }) }));

describe("menu do header", () => {
  it("marca a seção na tela como atual, e só ela", () => {
    render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <ThemeProvider>
          <SiteHeader />
        </ThemeProvider>
      </NextIntlClientProvider>,
    );
    const nav = screen.getByRole("navigation", { name: "Seções" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("aria-current"))).toEqual([null, "true", null]);
    expect(within(nav).getByRole("link", { name: "Projetos" })).toHaveAttribute("aria-current", "true");
  });
});
