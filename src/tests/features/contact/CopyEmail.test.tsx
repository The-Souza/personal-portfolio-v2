import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyEmail } from "@/features/contact/CopyEmail";
import { renderWithIntl } from "@/tests/helpers";

const EMAIL = "contato@thesouzatech.com.br";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

describe("CopyEmail", () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, "clipboard");
    window.getSelection()?.removeAllRanges();
  });

  it("mostra o e-mail como texto", () => {
    renderWithIntl(<CopyEmail email={EMAIL} />);
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
  });

  it("copia o e-mail e confirma", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    renderWithIntl(<CopyEmail email={EMAIL} />);

    fireEvent.click(screen.getByRole("button", { name: /Copiar e-mail/ }));

    expect(writeText).toHaveBeenCalledWith(EMAIL);
    expect(await screen.findByText("> copiado: ok")).toBeInTheDocument();
  });

  it("seleciona o texto quando a cópia falha", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    renderWithIntl(<CopyEmail email={EMAIL} />);

    fireEvent.click(screen.getByRole("button", { name: /Copiar e-mail/ }));

    expect(await screen.findByText("> selecionado: ctrl+c")).toBeInTheDocument();
    expect(window.getSelection()?.toString()).toBe(EMAIL);
  });

  it("seleciona o texto quando não há clipboard", async () => {
    renderWithIntl(<CopyEmail email={EMAIL} />);

    fireEvent.click(screen.getByRole("button", { name: /Copiar e-mail/ }));

    expect(await screen.findByText("> selecionado: ctrl+c")).toBeInTheDocument();
  });
});
