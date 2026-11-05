import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Boot } from "@/features/boot/Boot";
import { isBootDone, resetBootForTests } from "@/features/boot/boot-state";
import { renderWithIntl } from "@/tests/helpers";
import { mockMediaQueries } from "@/tests/media-query";

describe("Boot", () => {
  beforeEach(() => resetBootForTests());

  it("começa com o status de carregamento", () => {
    mockMediaQueries(() => false);
    renderWithIntl(<Boot />);
    expect(screen.getByRole("status", { name: "Carregando portfólio" })).toBeInTheDocument();
  });

  it("não aparece e entrega na hora com movimento reduzido", () => {
    mockMediaQueries((query) => query.includes("reduce"));
    renderWithIntl(<Boot />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(isBootDone()).toBe(true);
  });
});
