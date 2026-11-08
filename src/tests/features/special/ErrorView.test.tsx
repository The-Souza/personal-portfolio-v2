import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const error = Object.assign(new Error("boom"), { digest: "3f9a2c71" });

// Retries are counted per error in module state, so each test loads a fresh copy.
async function load() {
  vi.resetModules();
  const { ErrorView } = await import("@/features/special/ErrorView");
  const attempts = await import("@/features/special/retry-attempts");
  const { renderWithIntl } = await import("@/tests/helpers");
  return { ErrorView, attempts, renderWithIntl };
}

describe("ErrorView", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Only the property each test set: unstubbing all globals would also drop the matchMedia
    // stub from the setup, which GSAP needs.
    Reflect.deleteProperty(navigator, "sendBeacon");
    Reflect.deleteProperty(navigator, "clipboard");
  });

  const setNavigator = (key: "sendBeacon" | "clipboard", value: unknown) =>
    Object.defineProperty(navigator, key, { configurable: true, value });

  it("mostra o título e o digest no rodapé", async () => {
    const { ErrorView, renderWithIntl } = await load();
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Algo quebrou do meu lado.");
    expect(screen.getByText(/digest 3f9a2c71/)).toBeInTheDocument();
  });

  it("registra o erro", async () => {
    const { ErrorView, renderWithIntl } = await load();
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" />);
    expect(console.error).toHaveBeenCalledWith(error);
  });

  it("manda o erro para o log do servidor, com o digest e a rota", async () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    setNavigator("sendBeacon", sendBeacon);
    const { ErrorView, renderWithIntl } = await load();
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt/projetos" />);
    const report = JSON.parse(await (sendBeacon.mock.calls[0][1] as Blob).text());
    expect(report).toMatchObject({ source: "boundary", message: "boom", digest: "3f9a2c71", path: "/pt/projetos" });
  });

  it("tenta de novo: conta a tentativa e chama retry()", async () => {
    const { ErrorView, attempts, renderWithIntl } = await load();
    const retry = vi.fn();
    renderWithIntl(<ErrorView error={error} retry={retry} locale="pt" path="/pt" />);
    fireEvent.click(screen.getByRole("button", { name: /tentar de novo/i }));
    expect(attempts.attemptsFor("3f9a2c71")).toBe(1);
    await waitFor(() => expect(retry).toHaveBeenCalledOnce(), { timeout: 2000 });
  });

  it("não chama retry() duas vezes com cliques seguidos", async () => {
    const { ErrorView, renderWithIntl } = await load();
    const retry = vi.fn();
    renderWithIntl(<ErrorView error={error} retry={retry} locale="pt" path="/pt" />);
    const button = screen.getByRole("button", { name: /tentar de novo/i });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(retry).toHaveBeenCalledOnce(), { timeout: 2000 });
  });

  it("depois de uma tentativa que falhou, oferece copiar o digest", async () => {
    const { ErrorView, attempts, renderWithIntl } = await load();
    attempts.recordAttempt("3f9a2c71");
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" />);
    expect(screen.getByRole("button", { name: /copiar digest/i })).toBeInTheDocument();
  });

  it("na primeira vez não oferece copiar o digest", async () => {
    const { ErrorView, renderWithIntl } = await load();
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" />);
    expect(screen.queryByRole("button", { name: /copiar digest/i })).not.toBeInTheDocument();
  });

  it("sem digest (erro do navegador), mostra um traço e não oferece copiar", async () => {
    const { ErrorView, attempts, renderWithIntl } = await load();
    const browserError = new Error("quebrou no navegador");
    attempts.recordAttempt("quebrou no navegador");
    renderWithIntl(<ErrorView error={browserError} retry={() => {}} locale="pt" path="/pt" />);
    expect(screen.getByText(/digest —/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /copiar digest/i })).not.toBeInTheDocument();
  });

  it("mostra o arquivo do limite de erro no eyebrow", async () => {
    const { ErrorView, renderWithIntl } = await load();
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" file="global-error.tsx" />);
    expect(screen.getByText("// falha_de_sistema · global-error.tsx")).toBeInTheDocument();
  });

  it("copia o digest", async () => {
    const { ErrorView, attempts, renderWithIntl } = await load();
    const writeText = vi.fn().mockResolvedValue(undefined);
    setNavigator("clipboard", { writeText });
    attempts.recordAttempt("3f9a2c71");
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" />);
    fireEvent.click(screen.getByRole("button", { name: /copiar digest/i }));
    expect(writeText).toHaveBeenCalledWith("3f9a2c71");
    await waitFor(() => expect(screen.getByRole("button", { name: /copiado/i })).toBeInTheDocument());
  });
});
