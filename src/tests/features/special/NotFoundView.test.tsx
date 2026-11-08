import { render, screen } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../../messages/pt.json";

vi.mock("next-intl/server", async () => {
  const { createTranslator: create } = await import("next-intl");
  const all = (await import("../../../../messages/pt.json")).default;
  return {
    getLocale: async () => "pt",
    getTranslations: async (namespace: string) => create({ locale: "pt", messages: all, namespace: namespace as never }),
  };
});

// The address bar the visitor typed: the log reads it, not the route that rendered.
window.history.replaceState(null, "", "/pt/rota-que-nao-existe");

// jsdom has no ResizeObserver; the stage only uses it to place the slot.
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

async function renderNotFound() {
  const { NotFoundView } = await import("@/features/special/NotFoundView");
  return render(<NextIntlClientProvider locale="pt" messages={messages}>{await NotFoundView()}</NextIntlClientProvider>);
}

describe("NotFoundView", () => {
  const t = createTranslator({ locale: "pt", messages, namespace: "notFound" });

  it("mostra o título e o eyebrow", async () => {
    await renderNotFound();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("title"));
    expect(screen.getByText(t("eyebrow"))).toBeInTheDocument();
  });

  it("leva de volta ao início e aos projetos do idioma", async () => {
    await renderNotFound();
    expect(screen.getByRole("link", { name: /voltar pro início/i })).toHaveAttribute("href", "/pt");
    expect(screen.getByRole("link", { name: /ver projetos/i })).toHaveAttribute("href", "/pt#projects");
  });

  it("mostra no log a rota que o visitante tentou", async () => {
    await renderNotFound();
    expect(screen.getAllByText(/get \/pt\/rota-que-nao-existe/i).length).toBeGreaterThan(0);
  });

  it("deixa o 404 gigante fora dos leitores de tela", async () => {
    const { container } = await renderNotFound();
    const big = container.querySelector("[data-big] p");
    expect(big).toHaveAttribute("aria-hidden", "true");
    expect(big).toHaveTextContent("404");
  });
});
