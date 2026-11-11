import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActionLink } from "@/features/shared/ActionLink";

describe("ActionLink", () => {
  it("força a versão de texto da seta externa (U+FE0E), que o iOS mostrava como emoji", () => {
    const { container } = render(
      <ActionLink href="https://example.com" external>
        Ver site
      </ActionLink>,
    );
    expect(container.querySelector("a")?.textContent).toContain("↗︎");
  });

  it("desenha a seta externa na fonte mono, que tem o glifo (a do texto não tem, e o iOS caía numa seta maior)", () => {
    const { container } = render(
      <ActionLink href="https://example.com" external>
        Ver site
      </ActionLink>,
    );
    const arrow = [...container.querySelectorAll("span")].find((span) => span.textContent === "↗︎");
    expect(arrow).toHaveClass("font-mono");
  });

  it("mantém a seta de um link interno", () => {
    const { container } = render(<ActionLink href="#contact">Contato</ActionLink>);
    expect(container.querySelector("a")?.textContent).toContain("→");
  });

  it("abre um link externo em nova aba", () => {
    const { container } = render(
      <ActionLink href="https://example.com" external>
        Ver site
      </ActionLink>,
    );
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
