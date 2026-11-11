import { render, screen } from "@testing-library/react";
import { createTranslator, NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../../../messages/pt.json";

vi.mock("next-intl/server", async () => {
  const { createTranslator: create } = await import("next-intl");
  const all = (await import("../../../../../messages/pt.json")).default;
  return {
    getLocale: async () => "pt",
    getTranslations: async (namespace: string) => create({ locale: "pt", messages: all, namespace: namespace as never }),
  };
});

// The router's pathname. A direct visit gets the page through the proxy's fetch of the 404 route,
// so the router sits on that route; a client navigation is a rewrite, so it has the URL tried.
const router = vi.hoisted(() => ({ pathname: "/pt/off-the-map" }));
vi.mock("next/navigation", () => ({ usePathname: () => router.pathname }));

// The address bar the visitor typed: on a direct visit the log reads it.
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
  const { NotFoundView } = await import("@/features/special/not-found/NotFoundView");
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

  it("numa navegação pelo cliente, mostra a rota nova mesmo antes de a barra de endereço mudar", async () => {
    router.pathname = "/pt/outra-rota";
    try {
      await renderNotFound();
      expect(screen.getAllByText(/get \/pt\/outra-rota/i).length).toBeGreaterThan(0);
    } finally {
      router.pathname = "/pt/off-the-map";
    }
  });

  it("deixa o 404 gigante fora dos leitores de tela", async () => {
    const { container } = await renderNotFound();
    const big = container.querySelector("[data-big] p");
    expect(big).toHaveAttribute("aria-hidden", "true");
    expect(big).toHaveTextContent("404");
  });
});
