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
  });

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

  it("copia o digest", async () => {
    const { ErrorView, attempts, renderWithIntl } = await load();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    attempts.recordAttempt("3f9a2c71");
    renderWithIntl(<ErrorView error={error} retry={() => {}} locale="pt" path="/pt" />);
    fireEvent.click(screen.getByRole("button", { name: /copiar digest/i }));
    expect(writeText).toHaveBeenCalledWith("3f9a2c71");
    await waitFor(() => expect(screen.getByRole("button", { name: /copiado/i })).toBeInTheDocument());
    vi.unstubAllGlobals();
  });
});
